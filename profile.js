function initScript() {
    let timeout;
    services.Dom.watchRequests(() => {
        timeout = initTimeout(timeout);
    });
}

function initTimeout(interval) {
    if (interval) clearTimeout(interval);
    return setTimeout(() => {
        services.Dom.initCopyButtons();
        services.SalaryConverter.init();
        services.SalaryConverter.initCalculator();
    }, 1000);
}