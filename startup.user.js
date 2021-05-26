// ==UserScript==
// @name         Startup
// @namespace    http://tampermonkey.net/
// @version      0.6
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
// @require      https://github.com/FrostBy/anywhere/raw/master/services/configurator.js
// @require      https://github.com/FrostBy/anywhere/raw/master/services/filter.js
// @require      https://github.com/FrostBy/anywhere/raw/master/services/dom.js
// @require      https://github.com/FrostBy/anywhere/raw/master/services/proposal.js
// @require      https://github.com/FrostBy/anywhere/raw/master/startup.js
// @resource     IMPORTED_CSS https://github.com/FrostBy/anywhere/raw/master/startup.css
// ==/UserScript==

(() => {
    window.services = { Dom, Filter, Proposal, Configurator };
    window.GM_setValue = GM_setValue;
    window.GM_getValue = GM_getValue;
    GM_addStyle(GM_getResourceText('IMPORTED_CSS'));
    initScript();
})();