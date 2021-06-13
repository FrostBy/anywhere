function initScript() {
    services.Configurator.init();
    if (!services.Configurator.processBoard()) return;
    services.Filter.init();
    services.Proposal.init();
    services.StaffingReport.init();

    let requestsIterator = 0;
    services.Dom.watchRequests((event) => {
        if (event.type === 'loadstart') requestsIterator++;
        else if (event.type === 'loadend') requestsIterator--;
    });

    const proposalsWatcher = setInterval(() => {

        if (document.readyState !== 'complete' || !$('.profile-table tbody.ng-star-inserted').length || requestsIterator) return;
        if ($('.grid-cell-rect').length) {
            services.Filter.unlock();
            services.Dom.setClasses();
            services.Filter.calculate();
            services.Filter.reset();
            services.Dom.watchRequests(() => {
                const interval = setInterval(() => {
                    if (!$('.waiting-indicator').length) {
                        clearInterval(interval);
                        const newInterval = setInterval(() => {
                            services.Dom.setClasses();
                            if ($('.profile-table tbody.proposal').length) {
                                clearInterval(newInterval);
                                services.Filter.calculate();
                                services.Filter.refresh();
                            }
                        }, 100);
                    }
                }, 100);
            });
        }
        clearInterval(proposalsWatcher);
        services.Proposal.get();
    }, 10000);

    let idleTime = 0;
    //Increment the idle time counter every minute.
    setInterval(() => {
        idleTime++;
        if (idleTime % 3 === 0) services.Proposal.get(); //each 3 minutes
        if (idleTime >= 30) window.location.reload(); //30 minutes
    }, 60000); // 1 minute
    //Zero the idle timer on mouse movement.
    $(document).on('mousemove keypress', () => { idleTime = 0; });
}