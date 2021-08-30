const routes = [
    StartupRoute, ProfileRoute, ProfileEditRoute, ContainersRoute, RequisitionsRoute
];

let currentRoute;

function route(url) {
    console.log(`URL changed to ${location.href}`);
    const routeClass = routes.find(route => location.href.match(route.route));

    if (!routeClass) return;
    if (currentRoute) {
        if (currentRoute instanceof routeClass) return;
        currentRoute.terminate();
    }
    currentRoute = routeClass.init();
}

function initRouter() {
    services.Dom.Shared.initPlugins();

    let location = window.location;
    let previousUrl = '';

    new MutationObserver(function (mutations) {
        if (location.href !== previousUrl) {
            previousUrl = location.href;
            route(location.href);
        }
    }).observe(document.body, { childList: true, subtree: true });
}