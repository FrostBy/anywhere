function initScript() {
    services.Dom.initPlugins();

    let timeout;
    services.Dom.watchRequests(() => {
        timeout = initTimeout(timeout);
    });

    services.Dom.watchNextStep();
}

function initTimeout(interval) {
    if (interval) clearTimeout(interval);
    return setTimeout(() => {
        services.Dom.initCopyButtons();
        services.Salary.init();
        services.Salary.initOfferTool();
        services.Salary.initCalculator();
    }, 1000);
}