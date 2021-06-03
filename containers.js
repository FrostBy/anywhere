function initScript() {
    services.Configurator.init();
    services.Filter.init();

    let requestsIterator = 0;
    services.Dom.watchRequests((event) => {
        if (event.type === 'loadstart') requestsIterator++;
        else if (event.type === 'loadend') requestsIterator--;
    });
    const watcher = setInterval(() => {
        if (document.readyState !== 'complete' || !$('.dashboard-table tbody.ng-star-inserted, .profile-table tbody.ng-star-inserted').length || requestsIterator || $('.waiting-indicator').length) return;
        if ($('.grid-cell-rect').length) {
            services.Dom.setClasses();
            services.Configurator.refreshForm();
            services.Filter.unlock();
            services.Filter.reset();
            services.Filter.calculate();
            services.Configurator.watch();
            services.Dom.watchRequests(() => {
                const interval = setInterval(() => {
                    if (!$('.waiting-indicator').length) {
                        clearInterval(interval);
                        const newInterval = setInterval(() => {
                            services.Dom.setClasses();
                            if ($('.profile-table tbody.requisition, .dashboard-table tbody.container').length) {
                                clearInterval(newInterval);
                                services.Configurator.refreshForm();
                                services.Filter.refresh();
                                services.Filter.calculate();
                                services.Configurator.watch();
                            }
                        }, 100);
                    }
                }, 100);
            });
        }
        clearInterval(watcher);
    }, 1000);

    let idleTime = 0;
    //Increment the idle time counter every minute.
    setInterval(() => {
        idleTime++;
        if (idleTime >= 30) window.location.reload(); //30 minutes
    }, 60000); // 1 minute
    //Zero the idle timer on mouse movement.
    $(document).on('mousemove keypress', () => { idleTime = 0; });
}