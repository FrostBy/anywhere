class Requisition {
    static async getRequisitions(applicantId, limit = 20) {
        const api = new services.API();

        const containersData = await api.getContainers();
        let profile = await api.getApplicantProfile(applicantId);
        let country = api.getCountryFromLocation(profile.elmLocation).name;
        if (country === 'Kyrgyzstan') country = 'Kazakhstan';

        const containers = containersData.filter(container => country === container.location.name);
        containers.sort((a, b) => new Date(b.audit.created) - new Date(a.audit.created));

        const container = containers.find(container => container?.location.name);

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
        const api = new services.API();
        const activeRequisitions = await api.getRequisitions(container, Array.from(disciplines), limit, 0, ['Open: Under Review']);

        if (activeRequisitions.length < limit) {
            const inactiveRequisitions = await api.getRequisitions(container, Array.from(disciplines), limit, 0, ['On Hold', 'Draft', 'Submitted']);
            return activeRequisitions.concat(inactiveRequisitions).slice(0, limit);
        }

        return activeRequisitions;
    }
}