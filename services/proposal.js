Notification.requestPermission()
    .then(permission => { if (!('permission' in Notification)) Notification.permission = permission; }, rejection => {});

class Proposal {
    static get apiUrl() {
        return 'https://staffing.epam.com/api/b1/positions/[ID]/proposals?size=1000&q=staffingStatus=out=(Cancelled,Rejected)';
    }

    static get boardUrl() {
        return 'https://staffing.epam.com/positions/[ID]/proposals';
    }

    static get locationsUrl() {
        return 'https://staffing.epam.com/api/b1/locationService?size=1000&q=id=in=([IDS])';
    }

    static get interviewsUrl() {
        return 'https://staffing.epam.com/api/v1/applicants/[ID]/interview-and-request?size=1000';
    }

    static get applicantUrl() {
        return 'https://staffing.epam.com/api/v1/applicants/extended/[ID]';
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

    constructor(params = {}) {
        this.report = params.report;
        this.filter = params.filter;
    }

    initButton(){
        $('body').append('<div class="force-update-proposals" title="Request proposals in background">⇄</div>');
        $('.force-update-proposals').on('click', async () => {
            services.Dom.Shared.toggleSpinner(true);
            await this.get();
            services.Dom.Shared.toggleSpinner(false);
        });
    }

    terminate() {
        $('.force-update-proposals').remove();
        if (this.getLocationsRequest) this.getLocationsRequest.abort();
        if (this.getInterviewsRequests) this.getInterviewsRequests.map(request => request.abort());
        if (this.getRequest) this.getRequest.abort();
    }

    _retrieveISOCode(location) {
        if (location.isoCode || !location.parent) return {
            isoCode: location.isoCode || location.name,
            name: location.name
        };
        else return this._retrieveISOCode(location.parent);
    }

    async getLocations(ids = []) {
        const locations = {};

        if (this.getLocationsRequest) this.getLocationsRequest.abort();

        this.getLocationsRequest = $.get(Proposal.locationsUrl.replace('[IDS]', ids.join(',')));

        const data = await this.getLocationsRequest.promise();
        if (!data) return locations;

        data.content.forEach(location => {
            locations[location.id] = this._retrieveISOCode(location);
        });

        return locations;
    }

    async getInterviews(ids) {
        const interviews = {};

        if (this.getInterviewsRequests) this.getInterviewsRequests.map(request => request.abort());

        this.getInterviewsRequests = ids.map(id => $.get(Proposal.interviewsUrl.replace('[ID]', id)));

        const data = await Promise.all(this.getInterviewsRequests.map(request => request.promise()));
        if (!data) return interviews;


        data.forEach(allInterviews => {
            if (!allInterviews) return;
            const id = allInterviews[0].candidate.employeeId || allInterviews[0].candidate.applicantId;
            interviews[id] = allInterviews;
        });

        return interviews;
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
                            level: applicant.jobFunctionAfterInterview?.name,
                            english: applicant.englishLevel?.name,
                            location: applicant.location?.name,
                            locationId: applicant.location?.id,
                            skill: applicant.primarySkill?.name,
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

        services.Dom.Startup.setJobFunction(proposalsObject);
        services.Dom.Startup.setRequisitionStatus(requisitions);

        if (!this.report.config.applicants) {
            const locations = this.report.config.locations = await this.getLocations(Array.from(locationIds));
            const interviews = this.report.config.interviews = await this.getInterviews(Array.from(applicantIds));
            const applicants = this.report.config.applicants = reportRows.map(row => {
                const location = locations[row.locationId];

                if (location) row.location = `${location.name} (${location.isoCode})`;

                const interview = interviews[row.id]?.find(interview => interview.name === 'Technical' && interview.status === 'Completed');

                if (interview) {
                    const feedback = interview.interviewFeedback[0];
                    row.english = feedback.englishLevel?.name || row.english;
                    row.skill = feedback.primarySkill?.name || row.skill;
                    row.level = feedback.jobFunction?.name || row.level;
                }
                return row;
            });
            this.report.fill(applicants);
        }
    }
}