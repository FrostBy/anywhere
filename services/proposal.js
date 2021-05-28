Notification.requestPermission()
    .then(permission => { if (!('permission' in Notification)) Notification.permission = permission; }, rejection => {});

class Proposal {
    static get apiUrl() {
        return 'https://staffing.epam.com/api/b1/positions/[URL]/proposals?size=1000&q=staffingStatus=out=(Cancelled,Rejected)';
    }

    static get boardUrl() {
        return 'https://staffing.epam.com/positions/[URL]/proposals';
    }

    static get requisitionStatuses() {
        return {
            declined: [
                'Cancelled',
                'Rejected',
                'Offer: Cancelled',
                'Offer: Rejected',
                'Offer: Rejected By Candidate',
                'Offer: Conditions Not Met',
            ],
            accepted: [
                'Offer: Accepted',
            ],
        };
    }

    static init() {
        $('body').append('<div class="force-update-proposals" title="Request proposals in background">⇄</div>');
        $('.force-update-proposals').on('click', () => { Proposal.get();});
    }

    static get() {
        const boardId = window.location.href.match(/(\d+)/)[0];
        if (!boardId || !Object.keys(services.Configurator.get('boards')).includes(boardId)) return false;

        const proposalsObjectOld = JSON.parse(GM_getValue('proposals.' + boardId, '{}'));
        const proposalsObject = {};
        const diff = { new: {}, outdated: {}, changed: {} };

        $.get(Proposal.apiUrl.replace('[URL]', boardId), function (data) {
            const proposals = data.content;
            let showNotification = false;
            const requisitions = {};
            proposals.forEach(proposal => {
                const applicant = proposal.applicant || proposal.employee.applicant;
                const id = applicant.id;
                const status = proposal.advancedStatusDetails ? proposal.advancedStatusDetails.action.name : 'Preselected';
                const fullName = applicant.fullName;
                const changed = applicant.lastProcessStatusUpdateDate;
                const rawRequisitions = applicant.requisitionDashboardView || proposal.requisitionDashboardView || proposal.employee.requisitionDashboardView || [];
                if (rawRequisitions.length) requisitions[id] = { declined: [], accepted: [] };
                const applicantRequisitions = rawRequisitions.map(requisition => {
                    const data = {
                        id: requisition.requisitionId,
                        status: requisition.status,
                        jobFunction: requisition.jobFunction.name,
                        changed: requisition.lastStatusUpdateDate
                    };
                    if (Proposal.requisitionStatuses.declined.includes(data.status)) requisitions[id].declined.push(data);
                    else if (Proposal.requisitionStatuses.accepted.includes(data.status)) requisitions[id].accepted.push(data);
                    return data;
                });

                proposalsObject[id] = { id, status, fullName, changed, jobFunction: applicant.jobFunctionAfterInterview, requisitions: applicantRequisitions };
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
                services.Filter.enableRefresh();

                if (Notification.permission === 'granted') {
                    const notification = new Notification('Updates for you on the Startup page!', {
                        body: `New: ${Object.keys(diff.new).length} | Changed: ${Object.keys(diff.changed).length} | Outdated: ${Object.keys(diff.outdated).length}`,
                        icon: 'https://www.epam.com/etc/designs/epam-core/favicon/apple-touch-icon.png',
                        vibrate: true,
                    });
                    notification.onclick = () => {
                        if (window.closed) {
                            window.open(Proposal.boardUrl.replace('[URL]', boardId), '_blank').focus();
                        } else {
                            services.Dom.markProposals(diff);
                            window.focus();
                        }
                        notification.close();
                    };
                }
            }
            services.Dom.setJobFunction(proposalsObject);
            services.Dom.setRequisitionStatus(requisitions);
        });
    }
}