class Requisition {
    static get containersURL() {
        return 'https://staffing.epam.com/api/v1/hiring-container/dashboard';
    }

    static get requisitionsURL() {
        return 'https://staffing.epam.com/api/v1/hiring-container/[ID]/requisitions';
    }

    static async getRequisitions(locations = [], limit = 20) {
        if (!locations.length) return {};

        const containersData = await $.get(this.containersURL, {
            page: 0,
            size: 100,
            filterType: 'all',
            sort: ['audit.created,desc'],
            q: 'audit.creator.id=in=(4000741400010708873,4060741400035187120)'
        }).promise();

        if (locations.includes('Kyrgyzstan')) locations.push('Kazakhstan');

        const containers = containersData.content.filter(container => locations.includes(container.location.name));
        containers.sort((a, b) => new Date(b.audit.created) - new Date(a.audit.created));

        const container = containers.find(container => container.status === 'Approved' && container?.location.name);

        if (!container) return {};

        const activeDisciplines = new Set(services.Config.get(services.Configurator.Requisitions.key('disciplines.' + container.location.name), []));

        const requisitions = await this._getAvailableRequisitions(container, activeDisciplines, limit);
        requisitions.sort((a, b) => a.primarySkill.name.localeCompare(b.primarySkill.name));

        return {
            container: {
                code: container.code,
                id: container.id,
            },
            requisitions: requisitions.splice(0, limit).map(requisition => ({
                id: requisition.id,
                primarySkill: requisition.primarySkill.name,
                title: requisition.title.name,
                headline: requisition.headline,
                status: requisition.status
            }))
        };
    }

    static async _getAvailableRequisitions(container, disciplines, limit = 20) {
        const activeRequisitions = await this._getRequisitions(container, disciplines, limit, 0, ['Open: Under Review']);

        if (activeRequisitions.length < limit) {
            const inactiveRequisitions = await this._getRequisitions(container, disciplines, limit, 0, ['On Hold', 'Draft', 'Submitted']);
            return activeRequisitions.concat(inactiveRequisitions).slice(0, limit);
        }

        return activeRequisitions;
    }

    static async _getRequisitions(container, disciplines, limit = 20, page = 0, statuses = ['Open: Under Review', 'On Hold', 'Draft', 'Submitted'], prevRequisitions = []) {
        const requisitionsData = await $.get(this.requisitionsURL.replace('[ID]', container.id), {
            page,
            size: limit,
            sort: ['primarySkill.name', 'desc', 'ignore-case'],
            q: `status=in=("${statuses.join('","')}")${disciplines.size ? `;primarySkill.name=in=("${[...disciplines].join('","')}")` : ''}`
        }).promise();

        const requisitions = requisitionsData.content.filter(requisition => !requisition.applicantDashboardView && requisition.lastChangeDateForOnHold === requisition.lastStatusUpdateDate && !requisition.unit);
        const allRequisitions = prevRequisitions.concat(requisitions);

        if (requisitionsData.content.length >= limit && allRequisitions.length < limit) return this._getRequisitions(container, disciplines, limit, page + 1, statuses, allRequisitions);

        return allRequisitions;
    }
}