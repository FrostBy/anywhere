class API {
    get cache() { return services.Config.get('api', {}); }

    get expire() { return 60 * 60 * 1000; }

    getCache(key) {
        const data = this.cache[key];

        const expireDate = new Date();
        expireDate.setTime(expireDate.getTime() - data?.expire || this.expire);

        if (!data || expireDate >= new Date(data.date)) return undefined;
        return data.value;
    }

    setCache(key, value, expire = this.expire) {
        this.cache[key] = { date: new Date(), expire, value, };
        services.Config.set('api', this.cache);
        return value;
    }

    static get offersUrl() {
        return 'https://staffing.epam.com/api/v1/offer';
    }

    static get locationByStringUrl() {
        return 'https://staffing.epam.com/api/v1/elm/locations/findByNameOrSynonymName?searchString=[string]';
    }

    static get locationByID() {
        return 'https://staffing.epam.com/api/v1/elm/locations/[ID]';
    }

    static get interviewsUrl() {
        return 'https://staffing.epam.com/api/v1/interview';
    }

    constructor() {
        this.requests = {};
    }

    terminate() {
        Object.values(this.requests).forEach(request => Array.isArray(request) ? request.map(request => request.abort()) : request.abort());
    }

    async getInterviews(applicants, names, statuses, limit = applicants.length ? applicants.length * 10 : 1000, page = 0) {
        const candidate = applicants.length ? `candidate.applicantId=in=(${applicants.join(',')})` : '';
        const status = statuses.length ? `status=in=("${statuses.join('","')}")` : '';
        const name = names.length ? `name=in=("${names.join('","')}")` : '';
        const query = {
            size: 1000,
            sort: [],
            q: [status, candidate, name].filter(Boolean).join(';')
        };
        const data = await API.getRSQLRequest(limit, API.interviewsUrl, query, page);

        const interviews = {};
        data.forEach(interview => {
            const id = interview.candidate.applicantId;
            if (!interviews[id]) interviews[id] = [interview];
            else interviews[id].push(interview);
        });

        return interviews;
    }

    _retrieveISOCode(location) {
        if (location.isoCode && location.type === 'Country' || !location.parent) return {
            isoCode: location.isoCode || location.name,
            name: location.name,
            id: location.id
        };
        else return this._retrieveISOCode(location.parent);
    }

    async getLocations(ids = []) {
        if (this.requests.getLocationsRequests) this.requests.getLocationsRequests.map(request => request.abort());

        const locations = {};

        this.requests.getLocationsRequests = ids.map(id => $.get(API.locationByID.replace('[ID]', id)));

        const data = await Promise.all(this.requests.getLocationsRequests.map(request => request.promise()));
        if (!data) return locations;

        data.forEach(location => {
            locations[location.id] = this._retrieveISOCode(location);
        });

        return locations;
    }

    async getOffers(applicants = [], statuses = [], limit = 1000, page = 0) {
        const offerStatus = statuses.length ? `offerStatus=in=("${statuses.join('","')}")` : '';
        const applicant = applicants.length ? `applicant.id=in=(${applicants.join(',')})` : '';
        const query = {
            size: 1000,
            sort: [],
            filterType: 'approved',
            q: [offerStatus, applicant].filter(Boolean).join(';')
        };
        return API.getRSQLRequest(limit, API.offersUrl, query, page);
    }

    static async getRSQLRequest(limit, url, query = {}, page = 0, filter, prevResults = []) {
        query.page = page;
        const data = await $.get(url, query).promise();

        const result = filter ? data.content.filter(filter) : data.content;
        const allResults = prevResults.concat(result);

        if (result.length >= limit && allResults.length < limit) return this.getRSQLRequest(limit, url, query, page + 1, filter, prevResults);

        return allResults;
    }
}