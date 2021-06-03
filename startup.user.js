// ==UserScript==
// @name         Startup
// @namespace    http://tampermonkey.net/
// @version      0.62
// @description  The script helps to keep track of updates
// @author       Vladislav Romanovsky
// @contributor  Dmitry Scherbatykh
// @match        https://staffing.epam.com/positions/*
// @icon         https://www.google.com/s2/favicons?domain=epam.com
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @updateURL    https://github.com/FrostBy/anywhere/raw/master/startup.user.js
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.4.0/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/tooltipster/4.2.8/js/tooltipster.bundle.min.js
// @require      https://github.com/FrostBy/anywhere/raw/master/services/configurator/configurator.startup.js
// @require      https://github.com/FrostBy/anywhere/raw/master/services/filter/filter.startup.js
// @require      https://github.com/FrostBy/anywhere/raw/master/services/dom/dom.startup.js
// @require      https://github.com/FrostBy/anywhere/raw/master/services/proposal.js
// @require      https://github.com/FrostBy/anywhere/raw/master/startup.js
// @resource     IMPORTED_CSS_TOOLTIPSTER https://cdnjs.cloudflare.com/ajax/libs/tooltipster/4.2.8/css/tooltipster.bundle.min.css
// @resource     IMPORTED_CSS_SHARED https://github.com/FrostBy/anywhere/raw/master/css/shared.css
// @resource     IMPORTED_CSS https://github.com/FrostBy/anywhere/raw/master/css/startup.css
// ==/UserScript==

(() => {
    window.services = { Dom: DomStartup, Filter: FilterStartup, Proposal, Configurator: ConfiguratorStartup };
    window.GM_setValue = GM_setValue;
    window.GM_getValue = GM_getValue;
    GM_addStyle(GM_getResourceText('IMPORTED_CSS_TOOLTIPSTER'));
    GM_addStyle(GM_getResourceText('IMPORTED_CSS_SHARED'));
    GM_addStyle(GM_getResourceText('IMPORTED_CSS'));
    initScript();
})();