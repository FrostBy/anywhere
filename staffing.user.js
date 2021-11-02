// ==UserScript==
// @name         Staffing Desc Helper
// @namespace    http://tampermonkey.net/
// @version      2021.11.01
// @description  The script helps to work with Staffing Desk
// @author       Vladislav Romanovsky
// @contributor  Dmitry Scherbatykh
// @match        https://staffing.epam.com/*
// @icon         https://www.google.com/s2/favicons?domain=epam.com
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_info
// @grant        GM_xmlhttpRequest
// @updateURL    https://git.epam.com/vladislav_romanovsky/anywhere/-/raw/master/staffing.user.js

// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.4.0/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery-scrollTo/2.1.3/jquery.scrollTo.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/tooltipster/4.2.8/js/tooltipster.bundle.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/js/toastr.min.js

// @require      https://git.epam.com/vladislav_romanovsky/anywhere/-/raw/master/staffing/services/configurator/configurator.shared.js
// @require      https://git.epam.com/vladislav_romanovsky/anywhere/-/raw/master/staffing/services/configurator/configurator.requisitions.js
// @require      https://git.epam.com/vladislav_romanovsky/anywhere/-/raw/master/staffing/services/configurator/configurator.startup.js

// @require      https://git.epam.com/vladislav_romanovsky/anywhere/-/raw/master/staffing/services/dom/dom.shared.js
// @require      https://git.epam.com/vladislav_romanovsky/anywhere/-/raw/master/staffing/services/dom/dom.containers.js
// @require      https://git.epam.com/vladislav_romanovsky/anywhere/-/raw/master/staffing/services/dom/dom.startup.js
// @require      https://git.epam.com/vladislav_romanovsky/anywhere/-/raw/master/staffing/services/dom/dom.profile.js

// @require      https://git.epam.com/vladislav_romanovsky/anywhere/-/raw/master/staffing/services/filter/filter.shared.js
// @require      https://git.epam.com/vladislav_romanovsky/anywhere/-/raw/master/staffing/services/filter/filter.containers.js
// @require      https://git.epam.com/vladislav_romanovsky/anywhere/-/raw/master/staffing/services/filter/filter.requisitions.js
// @require      https://git.epam.com/vladislav_romanovsky/anywhere/-/raw/master/staffing/services/filter/filter.startup.js

// @require      https://git.epam.com/vladislav_romanovsky/anywhere/-/raw/master/staffing/services/config.js
// @require      https://git.epam.com/vladislav_romanovsky/anywhere/-/raw/master/staffing/services/engagementDetails.js
// @require      https://git.epam.com/vladislav_romanovsky/anywhere/-/raw/master/staffing/services/proposal.js
// @require      https://git.epam.com/vladislav_romanovsky/anywhere/-/raw/master/staffing/services/offer.js
// @require      https://git.epam.com/vladislav_romanovsky/anywhere/-/raw/master/staffing/services/requisition.js
// @require      https://git.epam.com/vladislav_romanovsky/anywhere/-/raw/master/staffing/services/salary.js
// @require      https://git.epam.com/vladislav_romanovsky/anywhere/-/raw/master/staffing/services/staffingReport.js
// @require      https://git.epam.com/vladislav_romanovsky/anywhere/-/raw/master/staffing/services/version.js
// @require      https://git.epam.com/vladislav_romanovsky/anywhere/-/raw/master/staffing/services/wizard.js

// @require      https://git.epam.com/vladislav_romanovsky/anywhere/-/raw/master/staffing/routes/containers.js
// @require      https://git.epam.com/vladislav_romanovsky/anywhere/-/raw/master/staffing/routes/requisitions.js
// @require      https://git.epam.com/vladislav_romanovsky/anywhere/-/raw/master/staffing/routes/requisitionEdit.js
// @require      https://git.epam.com/vladislav_romanovsky/anywhere/-/raw/master/staffing/routes/profile.js
// @require      https://git.epam.com/vladislav_romanovsky/anywhere/-/raw/master/staffing/routes/profileEdit.js
// @require      https://git.epam.com/vladislav_romanovsky/anywhere/-/raw/master/staffing/routes/startup.js
// @require      https://git.epam.com/vladislav_romanovsky/anywhere/-/raw/master/staffing/routes/router.js

// @resource     IMPORTED_CSS_TOOLTIPSTER https://cdnjs.cloudflare.com/ajax/libs/tooltipster/4.2.8/css/tooltipster.bundle.min.css
// @resource     IMPORTED_CSS_TOOLTIPSTER_LIGHT https://cdnjs.cloudflare.com/ajax/libs/tooltipster/4.2.8/css/plugins/tooltipster/sideTip/themes/tooltipster-sideTip-light.min.css
// @resource     IMPORTED_CSS_TOASTR https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/css/toastr.min.css

// @resource     IMPORTED_CSS_SHARED https://git.epam.com/vladislav_romanovsky/anywhere/-/raw/master/staffing/css/shared.css
// @resource     IMPORTED_CSS_STARTUP https://git.epam.com/vladislav_romanovsky/anywhere/-/raw/master/staffing/css/startup.css
// @resource     IMPORTED_CSS_CONTAINERS https://git.epam.com/vladislav_romanovsky/anywhere/-/raw/master/staffing/css/containers.css
// @resource     IMPORTED_CSS_PROFILE https://git.epam.com/vladislav_romanovsky/anywhere/-/raw/master/staffing/css/profile.css
// ==/UserScript==

(() => {
    window.services = {
        Config,
        Dom: { Shared: DomShared, Containers: DomContainers, Startup: DomStartup, Profile: DomProfile },
        Filter: { Shared: FilterShared, Startup: FilterStartup, Containers: FilterContainers, Requisitions: FilterRequisitions },
        StaffingReport,
        Proposal,
        Offer,
        Salary,
        EngagementDetails,
        Requisition,
        Wizard,
        Configurator: { Shared: ConfiguratorShared, Startup: ConfiguratorStartup, Requisitions: ConfiguratorRequisitions }
    };
    window.GM_setValue = GM_setValue;
    window.GM_getValue = GM_getValue;
    window.version = GM_info.script.version;
    window.updateURL = GM_info.script.updateURL;
    GM_addStyle(GM_getResourceText('IMPORTED_CSS_TOOLTIPSTER'));
    GM_addStyle(GM_getResourceText('IMPORTED_CSS_TOOLTIPSTER_LIGHT'));
    GM_addStyle(GM_getResourceText('IMPORTED_CSS_TOASTR'));

    GM_addStyle(GM_getResourceText('IMPORTED_CSS_SHARED'));
    GM_addStyle(GM_getResourceText('IMPORTED_CSS_STARTUP'));
    GM_addStyle(GM_getResourceText('IMPORTED_CSS_CONTAINERS'));
    GM_addStyle(GM_getResourceText('IMPORTED_CSS_PROFILE'));
    (async () => { if (await Version.check()) initRouter(); })();
})();