let startupRoute;

class StartupRoute {
    static get route() {
        return 'https://staffing.epam.com/positions/.*/proposals';
    }

    static init() {
        if (startupRoute) startupRoute.terminate();

        services.Configurator.Startup.init();

        startupRoute = new this();
        startupRoute.init();

        return startupRoute;
    }

    init() {
        if (!services.Configurator.Startup.processBoard()) return;

        this.filter = new services.Filter.Startup();
        this.report = new services.StaffingReport();
        this.proposal = new services.Proposal({ report: this.report, filter: this.filter });

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
                    this.proposal.initButton();
                    this.proposal.get();
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