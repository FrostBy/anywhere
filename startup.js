function initScript(){
    const proposalsWatcher = setInterval(() => {
        const positions = $('.profile-table tbody.ng-star-inserted');

        if (!positions.length) return;
        if ($('.grid-cell-rect').length) {
            services.Dom.setClasses();
            services.Filter.init();
            services.Filter.calculate();
            services.Filter.reset();
            services.Dom.watch();
        }

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

    services.Proposal.get();
}