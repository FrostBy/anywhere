class API {
    static get locationsUrl() {
        return 'https://staffing.epam.com/api/b1/locationService?size=1000&q=id=in=([IDS])';
    }

    static get interviewsUrl() {
        return 'https://staffing.epam.com/api/v1/applicants/[ID]/interview-and-request?size=200';
    }

    constructor() {
        this.requests = {};
    }

    terminate() {
        Object.values(this.requests).forEach(request => Array.isArray(request) ? request.map(request => request.abort()) : request.abort());
    }

    async getInterviews(ids) {
        if (this.requests.getInterviewsRequests) this.requests.getInterviewsRequests.map(request => request.abort());

        const interviews = {};

        this.requests.getInterviewsRequests = ids.map(id => $.get(API.interviewsUrl.replace('[ID]', id)));

        const data = await Promise.all(this.requests.getInterviewsRequests.map(request => request.promise()));
        if (!data) return interviews;


        data.forEach(allInterviews => {
            if (!allInterviews) return;
            const id = allInterviews[0].candidate.employeeId || allInterviews[0].candidate.applicantId;
            interviews[id] = allInterviews;
        });

        return interviews;
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

        this.getLocationsRequest = $.get(API.locationsUrl.replace('[IDS]', ids.join(',')));

        const data = await this.getLocationsRequest.promise();
        if (!data) return locations;

        data.content.forEach(location => {
            locations[location.id] = this._retrieveISOCode(location);
        });

        return locations;
    }
}