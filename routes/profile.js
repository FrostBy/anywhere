let profileRoute;

class ProfileRoute {
    static get bodyClass() { return 'profile'; }

    static get route() {
        return 'https://staffing.epam.com/applicants/.*';
    }

    static init() {
        if (profileRoute) profileRoute.terminate();

        profileRoute = new this();
        profileRoute.init();

        return profileRoute;
    }

    init() {
        $('body').addClass(this.constructor.bodyClass);

        services.Dom.Profile.initButtonsContainer();

        this.proposal = new services.Proposal();
        services.Dom.Profile.watchRequests(() => this.initTimeout());
        services.Dom.Profile.watchNextStep(this.proposal);
    }

    terminate(){
        this.proposal.terminate();

        if (this.timeout) clearTimeout(this.timeout);

        services.Dom.Profile.terminate();

        $('body').removeClass(this.constructor.bodyClass);
    }

    initTimeout() {
        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            services.Dom.Profile.initCopyButtons();
            services.Dom.Profile.initRequisitionButton();
            services.Salary.init();
        }, 1000);
    }
}
