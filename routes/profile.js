let profileRoute;

class ProfileRoute {
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
        this.proposal = new services.Proposal();
        services.Dom.Profile.watchRequests(() => this.initTimeout());
        services.Dom.Profile.watchNextStep(this.proposal);
    }

    terminate(){
        services.Dom.Profile.terminate();
        this.proposal.terminate();
        if (this.timeout) clearTimeout(this.timeout);
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
