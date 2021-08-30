let profileEditRoute;

class ProfileEditRoute {
    static get bodyClass() { return 'profile-edit'; }

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
        $('body').addClass(this.constructor.bodyClass);

        services.Dom.Profile.initButtonsContainer();

        services.Dom.Profile.watchRequests(() => this.initTimeout());
    }

    terminate() {
        if (this.timeout) clearTimeout(this.timeout);

        services.Dom.Profile.terminate();

        $('body').removeClass(this.constructor.bodyClass);
    }

    initTimeout() {
        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            services.Salary.initOfferTool();
            services.Salary.initCalculator();
        }, 1000);
    }
}