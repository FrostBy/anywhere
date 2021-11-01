let containerRoute;

class ContainersRoute {
    static get bodyClass() { return 'containers'; }

    static get route() {
        return 'https://staffing.epam.com/hiringContainers/all/*';
    }

    static init() {
        if (containerRoute) containerRoute.terminate();

        containerRoute = new this();
        containerRoute.init();

        return containerRoute;
    }

    init() {
        $('body').addClass(this.constructor.bodyClass);

        this.filter = new services.Filter.Containers();

        this.watchData();
    }

    terminate() {
        this.filter.terminate();

        if (this.watcher) this.watcher.disconnect();
        if (this.timeout) clearTimeout(this.timeout);
        if (this.watcherActions) this.watcherActions.disconnect();
        if (this.timeoutActions) clearTimeout(this.timeoutActions);

        $(document).off('mousemove.idle keypress.idle');

        services.Dom.Containers.terminate();

        $('body').removeClass(this.constructor.bodyClass);
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