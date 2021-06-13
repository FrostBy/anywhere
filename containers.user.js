// ==UserScript==
// @name         Containers
// @namespace    http://tampermonkey.net/
// @version      0.11
// @description  The script helps to work with hiring containers and requisitions for the Anywhere Team
// @author       Vladislav Romanovsky
// @match        https://staffing.epam.com/hiringContainers/*
// @icon         https://www.google.com/s2/favicons?domain=epam.com
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @updateURL    https://github.com/FrostBy/anywhere/raw/master/containers.user.js
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.4.0/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/tooltipster/4.2.8/js/tooltipster.bundle.min.js
// @require      https://github.com/FrostBy/anywhere/raw/master/services/configurator/configurator.shared.js
// @require      https://github.com/FrostBy/anywhere/raw/master/services/configurator/configurator.containers.js
// @require      https://github.com/FrostBy/anywhere/raw/master/services/filter/filter.containers.js
// @require      https://github.com/FrostBy/anywhere/raw/master/services/dom/dom.containers.js
// @require      https://github.com/FrostBy/anywhere/raw/master/containers.js
// @resource     IMPORTED_CSS_TOOLTIPSTER https://cdnjs.cloudflare.com/ajax/libs/tooltipster/4.2.8/css/tooltipster.bundle.min.css
// @resource     IMPORTED_CSS_SHARED https://github.com/FrostBy/anywhere/raw/master/css/shared.css
// @resource     IMPORTED_CSS https://github.com/FrostBy/anywhere/raw/master/css/containers.css
// ==/UserScript==

(() => {
    window.services = {
        Dom: DomContainers,
        Filter: FilterContainers,
        ConfiguratorShared,
        Configurator: ConfiguratorContainers
    };
    window.GM_setValue = GM_setValue;
    window.GM_getValue = GM_getValue;
    GM_addStyle(GM_getResourceText('IMPORTED_CSS_TOOLTIPSTER'));
    GM_addStyle(GM_getResourceText('IMPORTED_CSS_SHARED'));
    GM_addStyle(GM_getResourceText('IMPORTED_CSS'));
    initScript();
})();