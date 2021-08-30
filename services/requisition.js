class Requisition {
    static get containersURL() {
        return 'https://staffing.epam.com/api/v1/hiring-container/dashboard';
    }

    static get requisitionsURL() {
        return 'https://staffing.epam.com/api/v1/hiring-container/[ID]/requisitions';
    }

    static async getRequisitions(locations = []) {
        if (!locations.length) return [];

        const containersData = await $.get(this.containersURL, {
            page: 0,
            size: 100,
            filterType: 'all',
            sort: ['audit.created,desc'],
            q: 'audit.creator.id=in=(4000741400010708873,4060741400035187120)'
        }).promise();

        const containers = containersData.content.filter(container => locations.includes(container.location.name));
        containers.sort((a, b) => new Date(b.audit.created) - new Date(a.audit.created));

        const activeDisciplines = new Set(services.Config.get(services.Configurator.Containers.key('disciplines.' + containers[0].location.name), []));

        const requisitionsData = await $.get(this.requisitionsURL.replace('[ID]', containers[0].id), {
            page: 0,
            size: 1000,
            sort: ['primarySkill.name', 'desc', 'ignore-case'],
            q: `status=in=(Draft,Submitted,"Open: Under Review")${activeDisciplines.size ? `;primarySkill.name=in=(${[...activeDisciplines].join(',')})` : ''}`
        }).promise();
        const requisitions = requisitionsData.content.filter(requisition => !requisition.applicantDashboardView && requisition.lastChangeDateForOnHold === requisition.lastStatusUpdateDate || !requisition.unit);
        requisitions.sort((a, b) => a.primarySkill.name.localeCompare(b.primarySkill.name));

        return {
            container: {
                code: containers[0].code,
                id: containers[0].id,
            },
            requisitions: requisitions.map(requisition => ({
                id: requisition.id,
                primarySkill: requisition.primarySkill.name,
                title: requisition.title.name,
                headline: requisition.headline
            }))
        };
    }
}