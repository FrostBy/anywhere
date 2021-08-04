function initScript() {
    services.Dom.initCopyButtons();
    services.SalaryConverter.init();
    services.SalaryConverter.initCalculator();

    $('.entity-page-toggle').on('click', () => {
        services.Dom.initCopyButtons();
        services.SalaryConverter.init();
    });

    function initTabClickListener() {
        $('.tabs-heading a').on('click', (e) => {
            setTimeout(() => {
                initTabClickListener();
                if ($(e.target)[0].textContent === 'Profile') {
                    services.Dom.initCopyButtons();
                    services.SalaryConverter.init();
                }
            }, 500);
        });
    }

    initTabClickListener();
}