let requisitionRoute;

class RequisitionsRoute {
    static get bodyClass() { return 'requisitions'; }

    static get route() {
        return 'https://staffing.epam.com/hiringContainers/.*/requisitions';
    }

    static init() {
        if (requisitionRoute) requisitionRoute.terminate();

        requisitionRoute = new this();
        requisitionRoute.init();

        return requisitionRoute;
    }

    init() {
        $('body').addClass(this.constructor.bodyClass);

        services.Dom.Containers.initButtonsContainer();
        services.Configurator.Requisitions.init();

        this.filter = new services.Filter.Requisitions();

        this.watchData();
        this.idleTimer();
    }

    terminate() {
        services.Configurator.Requisitions.terminate();
        this.filter.terminate();

        if (this.watcher) this.watcher.disconnect();
        if (this.timeout) clearTimeout(this.timeout);
        if (this.watcherActions) this.watcherActions.disconnect();
        if (this.timeoutActions) clearTimeout(this.timeoutActions);

        if (this.interval) clearInterval(this.interval);

        $(document).off('mousemove.idle keypress.idle');

        services.Dom.Containers.terminate();

        $('body').removeClass(this.constructor.bodyClass);
    }

    idleTimer() {
        let idleTime = 0;
        //Increment the idle time counter every minute.
        this.interval = setInterval(() => {
            idleTime++;
            if (idleTime >= 30) window.location.reload(); //30 minutes
        }, 60000); // 1 minute
        //Zero the idle timer on mouse movement.
        $(document).on('mousemove.idle keypress.idle', () => { idleTime = 0; });
    }

    watchData() {
        this.timeout = undefined;
        this.watcher = services.Dom.Containers.waitForAddedNode({
            selector: '.data-table tbody tr',
            parent: document.body,
            recursive: true,
            disconnect: false,
            done: (element, params) => {
                if (document.readyState !== 'complete') return;

                if (this.timeout) clearTimeout(this.timeout);

                this.timeout = setTimeout(() => {
                    services.Dom.Containers.setClasses();
                    services.Configurator.Requisitions.refreshForm(this.filter);
                    this.filter.unlock();
                    this.filter.reset();
                    this.filter.calculate();
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
                this.watchData();
            }
        });
    }

}