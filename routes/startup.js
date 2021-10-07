let startupRoute;

class StartupRoute {
    static get bodyClass() { return 'startup'; }

    static get route() {
        return 'https://staffing.epam.com/positions/.*/proposals';
    }

    static init() {
        if (startupRoute) startupRoute.terminate();

        startupRoute = new this();
        startupRoute.init();

        return startupRoute;
    }

    constructor() {
        this.data = {};
        this.getDataRequestDone = false;
    }

    async getData() {
        this.getDataRequestDone = false;
        this.data.proposals = await this.proposal.get();
        this.data.offers = await this.offer.get(this.data.proposals);
        this.data.report = await this.report.get(this.data.offers.reportRows, this.data.offers.locationIds, this.data.offers.applicantIds);
        this.getDataRequestDone = true;
    }

    updateDOM() {
        const interval = setInterval(() => {
            if (this.getDataRequestDone) {
                clearInterval(interval);
                services.Dom.Startup.setJobFunction(this.data.proposals);
                services.Dom.Startup.setOfferStatus(this.data.offers.offers);
                this.report.fill(this.data.report);

                this.filter.setEmployees(this.data.proposals);
                this.filter.refresh();
            }
        }, 1000);
    }

    init() {
        $('body').addClass(this.constructor.bodyClass);

        services.Dom.Startup.initButtonsContainer();
        services.Configurator.Startup.init();

        if (!services.Configurator.Startup.processBoard()) return;

        this.filter = new services.Filter.Startup();
        this.report = new services.StaffingReport();
        this.proposal = new services.Proposal({ report: this.report, filter: this.filter });
        this.offer = new services.Offer();

        this.report.init();
        this.getData();
        services.Dom.Startup.initGetDataButton(async () => {
            await this.getData();
            this.updateDOM();
        });

        this.watchProposals();
        this.idleTimer();
    }

    terminate() {
        services.Configurator.Startup.terminate();
        this.proposal.terminate();
        this.filter.terminate();
        this.report.terminate();

        if (this.watcher) this.watcher.disconnect();
        if (this.timeout) clearTimeout(this.timeout);
        if (this.watcherActions) this.watcherActions.disconnect();
        if (this.timeoutActions) clearTimeout(this.timeoutActions);

        if (this.interval) clearInterval(this.interval);

        $(document).off('mousemove.idle keypress.idle');

        services.Dom.Startup.terminate();

        $('body').removeClass(this.constructor.bodyClass);
    }

    watchProposals() {
        this.timeout = undefined;
        this.watcher = services.Dom.Startup.waitForAddedNode({
            selector: '.profile-table tbody tr',
            parent: document.body,
            recursive: true,
            disconnect: false,
            done: (element, params) => {
                if (document.readyState !== 'complete') return;

                if (this.timeout) clearTimeout(this.timeout);

                this.timeout = setTimeout(() => {
                    this.filter.unlock();
                    services.Dom.Startup.setClasses();
                    this.filter.calculate();
                    this.filter.reset();
                    this.updateDOM();
                    this.watcher.disconnect();
                    this.watchActions();
                }, 2000);
            }
        });
    }

    watchActions() {
        this.timeoutActions = undefined;
        this.watcherActions = services.Dom.Startup.waitForAddedNode({
            selector: '.waiting-indicator',
            parent: document.body,
            recursive: true,
            disconnect: true,
            done: (element, params) => {
                if (document.readyState !== 'complete') return;
                if (this.timeoutActions) clearTimeout(this.timeoutActions);

                this.timeoutActions = setTimeout(() => this.watchProposals(), 2000);
            }
        });
    }

    idleTimer() {
        let idleTime = 0;
        //Increment the idle time counter every minute.
        this.interval = setInterval(() => {
            idleTime++;
            if (idleTime % 3 === 0) this.proposal.get(); //each 3 minutes
            if (idleTime >= 30) window.location.reload(); //30 minutes
        }, 60000); // 1 minute
        //Zero the idle timer on mouse movement.
        $(document).on('mousemove.idle keypress.idle', () => { idleTime = 0; });
    }
}