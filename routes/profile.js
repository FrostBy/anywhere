let profileRoute;

class ProfileRoute {
    static get bodyClass() { return 'profile'; }

    static get route() {
        return 'https://staffing.epam.com/applicants/.*';
    }

    static get id() { return window.location.href.match(/(\d+)/)[0]; }

    get id() { return this.constructor.id; }

    static init() {
        if (profileRoute) profileRoute.terminate();

        profileRoute = new this();
        profileRoute.init();

        return profileRoute;
    }

    async init() {
        $('body').addClass(this.constructor.bodyClass);

        services.Dom.Profile.initButtonsContainer();

        this.proposal = new services.Proposal();
        services.Dom.Profile.watchRequests(() => this.initTimeout());
        services.Dom.Profile.watchNextStep(this.proposal);

        services.Dom.Profile.markHiringWeek(await this.isHiringWeek());
    }

    terminate() {
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

    async isHiringWeek() {
        const profile = await this.proposal.getApplicant(this.id);
        return !!profile.poolContainerDashboardView?.find(pool=> pool.code === 'PC-XX-HREV');
    }
}
