Notification.requestPermission()
    .then(permission => { if (!('permission' in Notification)) Notification.permission = permission; }, rejection => {});

class Proposal {
    static get apiUrl() {
        return 'https://staffing.epam.com/api/b1/positions/[ID]/proposals?size=1000&q=staffingStatus=out=(Cancelled,Rejected)';
    }

    static get boardUrl() {
        return 'https://staffing.epam.com/positions/[ID]/proposals';
    }

    static get applicantUrl() {
        return 'https://staffing.epam.com/api/v1/applicants/extended/[ID]';
    }

    constructor(params = {}) {
        this.report = params.report;
        this.filter = params.filter;
    }

    terminate() {
        if (this.getRequest) this.getRequest.abort();
    }

    async getApplicant(id) {
        return new Promise((resolve) => {
            $.get(Proposal.applicantUrl.replace('[ID]', id), async data => {
                resolve(data);
            });
        });
    }

    async get() {
        const boardId = window.location.href.match(/(\d+)/)[0];
        const boards = Object.keys(services.Config.get('boards', []));
        if (!boardId || boards.length && !boards.includes(boardId)) return false;

        const proposalsObjectOld = JSON.parse(GM_getValue('proposals.' + boardId, '{}'));
        const proposalsObject = {};
        const diff = { new: {}, outdated: {}, changed: {} };

        if (this.getRequest) this.getRequest.abort();

        this.getRequest = $.get(Proposal.apiUrl.replace('[ID]', boardId));

        const data = await this.getRequest.promise();

        if (!data) return;

        let showNotification = false;
        const proposals = data.content;

        proposals.forEach(proposal => {
            const applicant = proposal.applicant || proposal.employee.applicant;
            const id = applicant.id;
            const status = proposal.advancedStatusDetails?.action.name || 'Preselected';
            const fullName = applicant.fullName;
            const changed = applicant.lastProcessStatusUpdateDate;

            proposalsObject[id] = {
                id,
                status,
                fullName,
                changed,
                jobFunction: applicant.jobFunctionAfterInterview,
            };

            const proposalOld = proposalsObjectOld[id];

            if (!proposalOld) {
                diff.new[id] = proposalsObject[id];
                showNotification = true;
            } else if (new Date(proposalOld.changed) < new Date(changed)) {
                diff.changed[id] = proposalsObject[id];
                showNotification = true;
            }
        });

        for (const proposalOld of Object.values(proposalsObjectOld)) {
            if (!proposalsObject[proposalOld.id]) {
                diff.outdated[proposalOld.id] = proposalOld;
                showNotification = true;
            }
        }

        GM_setValue('proposals.' + boardId, JSON.stringify(proposalsObject));

        if (showNotification) {
            this.filter.enableRefresh();

            if (Notification.permission === 'granted') {
                const notification = new Notification('Updates for you on the Startup page!', {
                    body: `New: ${Object.keys(diff.new).length} | Changed: ${Object.keys(diff.changed).length} | Outdated: ${Object.keys(diff.outdated).length}`,
                    icon: 'https://www.epam.com/etc/designs/epam-core/favicon/apple-touch-icon.png',
                    vibrate: true,
                });
                notification.onclick = () => {
                    if (window.closed) {
                        window.open(Proposal.boardUrl.replace('[ID]', boardId), '_blank').focus();
                    } else {
                        services.Dom.Startup.markProposals(diff);
                        window.focus();
                    }
                    notification.close();
                };
            }
        }

        return proposalsObject;
    }
}