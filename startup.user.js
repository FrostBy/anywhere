// ==UserScript==
// @name         Startup
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  The script helps to keep track of updates
// @author       Dmitry Scherbatykh
// @contributor  Vladislav Romanovsky
// @match        https://staffing.epam.com/positions/153695794/proposals
// @icon         https://www.google.com/s2/favicons?domain=epam.com
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.4.0/jquery.min.js
// @require      https://raw.githubusercontent.com/FrostBy/anywhere/master/startup.js
// @resource     IMPORTED_CSS https://raw.githubusercontent.com/FrostBy/anywhere/master/startup.css
// ==/UserScript==

(function() {
    window.GM_setValue = GM_setValue;
    window.GM_getValue = GM_getValue;
    GM_addStyle(GM_getResourceText('IMPORTED_CSS'));
})();