// ==UserScript==
// @name         Staffing Desc Helper
// @namespace    http://tampermonkey.net/
// @version      2021.08.28
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
// @updateURL    https://github.com/FrostBy/anywhere/raw/master/helper.user.js

// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.4.0/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/tooltipster/4.2.8/js/tooltipster.bundle.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/js/toastr.min.js

// @require      file:///F:/domains/anywhere/services/configurator/configurator.shared.js
// @require      file:///F:/domains/anywhere/services/configurator/configurator.requisitions.js
// @require      file:///F:/domains/anywhere/services/configurator/configurator.startup.js

// @require      file:///F:/domains/anywhere/services/dom/dom.shared.js
// @require      file:///F:/domains/anywhere/services/dom/dom.containers.js
// @require      file:///F:/domains/anywhere/services/dom/dom.startup.js
// @require      file:///F:/domains/anywhere/services/dom/dom.profile.js

// @require      file:///F:/domains/anywhere/services/filter/filter.shared.js
// @require      file:///F:/domains/anywhere/services/filter/filter.containers.js
// @require      file:///F:/domains/anywhere/services/filter/filter.requisitions.js
// @require      file:///F:/domains/anywhere/services/filter/filter.startup.js

// @require      file:///F:/domains/anywhere/services/config.js
// @require      file:///F:/domains/anywhere/services/engagementDetails.js
// @require      file:///F:/domains/anywhere/services/proposal.js
// @require      file:///F:/domains/anywhere/services/requisition.js
// @require      file:///F:/domains/anywhere/services/salary.js
// @require      file:///F:/domains/anywhere/services/staffingReport.js
// @require      file:///F:/domains/anywhere/services/version.js
// @require      file:///F:/domains/anywhere/services/wizard.js

// @require      file:///F:/domains/anywhere/routes/containers.js
// @require      file:///F:/domains/anywhere/routes/requisitions.js
// @require      file:///F:/domains/anywhere/routes/profile.js
// @require      file:///F:/domains/anywhere/routes/profileEdit.js
// @require      file:///F:/domains/anywhere/routes/startup.js
// @require      file:///F:/domains/anywhere/routes/router.js

// @resource     IMPORTED_CSS_TOOLTIPSTER https://cdnjs.cloudflare.com/ajax/libs/tooltipster/4.2.8/css/tooltipster.bundle.min.css
// @resource     IMPORTED_CSS_TOOLTIPSTER_LIGHT https://cdnjs.cloudflare.com/ajax/libs/tooltipster/4.2.8/css/plugins/tooltipster/sideTip/themes/tooltipster-sideTip-light.min.css
// @resource     IMPORTED_CSS_TOASTR https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/css/toastr.min.css

// @resource     IMPORTED_CSS_SHARED file:///F:/domains/anywhere/css/shared.css
// @resource     IMPORTED_CSS_STARTUP file:///F:/domains/anywhere/css/startup.css
// @resource     IMPORTED_CSS_CONTAINERS file:///F:/domains/anywhere/css/containers.css
// @resource     IMPORTED_CSS_PROFILE file:///F:/domains/anywhere/css/profile.css
// ==/UserScript==

(() => {
    window.services = {
        Config,
        Dom: { Shared: DomShared, Containers: DomContainers, Startup: DomStartup, Profile: DomProfile },
        Filter: { Shared: FilterShared, Startup: FilterStartup, Containers: FilterContainers, Requisitions: FilterRequisitions },
        StaffingReport,
        Proposal,
        Salary,
        EngagementDetails,
        Requisition,
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