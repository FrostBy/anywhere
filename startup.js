function initScript() {
    let requestsIterator = 0;
    services.Dom.watchRequests((event) => {
        if (event.type === 'loadstart') requestsIterator++;
        else if (event.type === 'loadend') requestsIterator--;
    });

    const proposalsWatcher = setInterval(() => {
        console.log(requestsIterator);
        if (document.readyState !== 'complete' || !$('.profile-table tbody.ng-star-inserted').length || requestsIterator) return;
        if ($('.grid-cell-rect').length) {
            services.Dom.setClasses();
            services.Filter.init();
            services.Filter.calculate();
            services.Filter.reset();
            services.Dom.watchRequests(() => {
                const interval = setInterval(() => {
                    if (!$('.waiting-indicator').length) {
                        clearInterval(interval);
                        const newInterval = setInterval(() => {
                            Dom.setClasses();
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

        services.Proposal.get();
        clearInterval(proposalsWatcher);
    }, 1000);

    let idleTime = 0;
    //Increment the idle time counter every minute.
    setInterval(() => {
        idleTime++;
        if (idleTime >= 5) services.Proposal.get(); //5 minutes
        if (idleTime >= 30) window.location.reload(); //30 minutes
    }, 60000); // 1 minute
    //Zero the idle timer on mouse movement.
    $(document).on('mousemove keypress', () => { idleTime = 0; });
}