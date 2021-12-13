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

    static get getApplicantProfile() {
        return 'https://staffing.epam.com/api/v1/applicants/extended/[ID]';
    }

    static get offersUrl() {
        return 'https://staffing.epam.com/api/v1/offer';
    }

    static get locationByStringUrl() {
        return 'https://staffing.epam.com/api/v1/elm/locations/findByNameOrSynonymName?searchString=[STRING]';
    }

    static get locationByID() {
        return 'https://staffing.epam.com/api/v1/elm/locations/[ID]';
    }

    static get interviewsUrl() {
        return 'https://staffing.epam.com/api/v1/interview';
    }

    static get containersURL() {
        return 'https://staffing.epam.com/api/v1/hiring-container/dashboard';
    }

    static get requisitionsURL() {
        return 'https://staffing.epam.com/api/v1/hiring-container/[ID]/requisitions';
    }

    constructor() {
        this.requests = {};
    }

    terminate() {
        Object.values(this.requests).forEach(request => Array.isArray(request) ? request.map(request => request.abort()) : request.abort());
    }

    async getInterviews(applicants, names, statuses, limit = applicants.length ? applicants.length * 10 : 1000, page = 0) {
        const query = {
            size: 1000,
            sort: [],
            q: API._buildQ([[names, 'name'], [statuses, 'status'], [applicants, 'candidate.applicantId']])
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

    getCountryFromLocation(location) {
        if (location.type === 'Country' || !location.parent) return {
            isoCode: location.isoCode || location.name,
            name: location.name,
            id: location.id
        };
        else return this.getCountryFromLocation(location.parent);
    }

    async getLocations(ids = []) {
        if (this.requests.getLocationsRequests) this.requests.getLocationsRequests.map(request => request.abort());

        const locations = {};

        this.requests.getLocationsRequests = ids.map(id => $.get(API.locationByID.replace('[ID]', id)));

        const data = await Promise.all(this.requests.getLocationsRequests.map(request => request.promise()));
        if (!data) return locations;

        data.forEach(location => {
            locations[location.id] = this.getCountryFromLocation(location);
        });

        return locations;
    }

    async getLocationsByStrings(strings = []) {
        if (this.requests.getLocationsRequests) this.requests.getLocationsRequests.map(request => request.abort());

        const locations = {};

        this.requests.getLocationsRequests = strings.map(string => $.get(API.locationByStringUrl.replace('[STRING]', string)));

        const data = await Promise.all(this.requests.getLocationsRequests.map(request => request.promise()));
        if (!data) return locations;

        data.forEach(collection => {
            collection.content.map(location => {
                locations[location.id] = this.getCountryFromLocation(location);
            });
        });

        return locations;
    }

    async getApplicantProfile(id) {
        if (this.requests.getApplicantProfileRequests) this.requests.getApplicantProfileRequests.abort();
        this.requests.getApplicantProfileRequests = $.get(API.getApplicantProfile.replace('[ID]', id));

        const data = await this.requests.getApplicantProfileRequests.promise();

        return data || undefined;
    }

    async getOffers(applicants = [], statuses = [], limit = 1000, page = 0) {
        const query = {
            size: 1000,
            sort: [],
            filterType: 'approved',
            q: API._buildQ([[statuses, 'offerStatus'], [applicants, 'applicant.id']])

        };
        return API.getRSQLRequest(limit, API.offersUrl, query, page);
    }

    async getContainers() {
        const query = {
            size: 100,
            filterType: 'all',
            sort: ['audit.created,desc'],
            q: API._buildQ([[['4000741400010708873', '4060741400035187120'], 'audit.creator.id'], [['Approved'], 'status']])
        };
        return API.getRSQLRequest(100, API.containersURL, query, 0);
    }

    async getRequisitions(container, disciplines, limit = 20, page = 0, statuses = ['Open: Under Review', 'On Hold', 'Draft', 'Submitted']) {
        const query = {
            size: limit,
            sort: ['primarySkill.name', 'desc', 'ignore-case'],
            q: API._buildQ([[statuses, 'status'], [disciplines, 'primarySkill.name']])
        };
        const filter = requisition => !requisition.applicantDashboardView && requisition.lastChangeDateForOnHold === requisition.lastStatusUpdateDate && !requisition.unit;
        return API.getRSQLRequest(100, API.requisitionsURL.replace('[ID]', container.id), query, 0, filter);
    }

    static _buildQ(data = []) {
        return data.map(row => {
            if (!row[0].length) return false;
            const isString = typeof row[0][0] === 'string';
            return isString ? `${row[1]}=in=("${row[0].join('","')}")` : `${row[1]}=in=(${row[0].join(',')})`;
        }).filter(Boolean).join(';');
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