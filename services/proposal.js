Notification.requestPermission()
    .then(permission => { if (!('permission' in Notification)) Notification.permission = permission; }, rejection => {});

class Proposal {
    static get apiUrl() {
        return 'https://staffing.epam.com/api/b1/positions/[URL]/proposals?size=1000&q=staffingStatus=out=(Cancelled,Rejected)';
    }

    static get boardUrl() {
        return 'https://staffing.epam.com/positions/[URL]/proposals';
    }

    static get locationsUrl() {
        return 'https://staffing.epam.com/api/b1/locationService?size=1000&q=id=in=([IDS])';
    }

    static get interviewsUrl() {
        return 'https://staffing.epam.com/api/v1/applicants/[ID]/interview-and-request?size=1000';
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

    static _retrieveISOCode(location) {
        if (location.isoCode) return { isoCode: location.isoCode, name: location.name };
        else return this._retrieveISOCode(location.parent);
    }

    static async getLocations(ids = []) {
        return new Promise((resolve) => {
            $.get(Proposal.locationsUrl.replace('[IDS]', ids.join(',')), data => {
                const locations = {};
                data.content.forEach(location => {
                    locations[location.id] = Proposal._retrieveISOCode(location);
                });
                resolve(locations);
            });
        });
    }

    static async getInterviews(ids) {
        const requests = ids.map(id => $.get(Proposal.interviewsUrl.replace('[ID]', id)));
        return new Promise((resolve) => {
            $.when(...requests).done(function () {
                const interviews = {};
                Object.values(arguments).forEach(response => {
                    const allInterviews = response[0];
                    const id = allInterviews[0].candidate.employeeId || allInterviews[0].candidate.applicantId;
                    interviews[id] = allInterviews;
                });
                resolve(interviews);
            });
        });
    }

    static async get() {
        const boardId = window.location.href.match(/(\d+)/)[0];
        if (!boardId || !Object.keys(services.Config.get('boards')).includes(boardId)) return false;

        const proposalsObjectOld = JSON.parse(GM_getValue('proposals.' + boardId, '{}'));
        const proposalsObject = {};
        const diff = { new: {}, outdated: {}, changed: {} };

        $.get(Proposal.apiUrl.replace('[URL]', boardId), async data => {
            let showNotification = false;
            const proposals = data.content;
            const requisitions = {};
            const reportRows = [];
            const applicantIds = new Set();
            const locationIds = new Set();

            proposals.forEach(proposal => {
                const applicant = proposal.applicant || proposal.employee.applicant;
                const id = applicant.id;
                const status = proposal.advancedStatusDetails?.action.name || 'Preselected';
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
                    else if (Proposal.requisitionStatuses.accepted.includes(data.status)) {
                        locationIds.add(applicant.location.id);
                        applicantIds.add(id);
                        if (proposal.advancedStatusDetails?.action?.name === 'Offer Acceptance') {
                            reportRows.push({
                                fullName,
                                id,
                                level: applicant.jobFunctionAfterInterview.name,
                                english: applicant.englishLevel.name,
                                location: applicant.location.name,
                                locationId: applicant.location.id,
                                skill: applicant.primarySkill.name,
                            });
                        }

                        requisitions[id].accepted.push(data);
                    }
                    return data;
                });

                proposalsObject[id] = {
                    id,
                    status,
                    fullName,
                    changed,
                    jobFunction: applicant.jobFunctionAfterInterview,
                    requisitions: applicantRequisitions
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

            if (!services.StaffingReport.config.applicants) {
                const locations = services.StaffingReport.config.locations = await Proposal.getLocations(Array.from(locationIds));
                const interviews = services.StaffingReport.config.interviews = await Proposal.getInterviews(Array.from(applicantIds));
                const applicants = services.StaffingReport.config.applicants = reportRows.map(row => {
                    const location = locations[row.locationId];

                    if (location) row.location = `${location.name} (${location.isoCode})`;

                    const interview = interviews[row.id]?.find(interview => interview.name === 'Technical' && interview.status === 'Completed') || undefined;
                    if (interview) {
                        const feedback = interview.interviewFeedback[0];
                        row.english = feedback.englishLevel?.name || row.english;
                        row.skill = feedback.primarySkill?.name || row.skill;
                        row.level = feedback.jobFunction?.name || row.level;
                    }
                    return row;
                });
                services.StaffingReport.fill(applicants);
            }
        });
    }
}