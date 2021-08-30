let profileEditRoute;

class ProfileEditRoute {
    static get route() {
        return 'https://staffing.epam.com/applicant/edit.*';
    }

    static init() {
        if (profileEditRoute) profileEditRoute.terminate();

        profileEditRoute = new this();
        profileEditRoute.init();

        return profileEditRoute;
    }

    init() {
        services.Dom.Profile.watchRequests(() => this.initTimeout());
    }

    terminate(){
        services.Dom.Profile.terminate();
        if (this.timeout) clearTimeout(this.timeout);
    }

    initTimeout() {
        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            services.Salary.initOfferTool();
            services.Salary.initCalculator();
        }, 1000);
    }
}