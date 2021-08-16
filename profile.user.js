// ==UserScript==
// @name         Applicant/User Profile
// @namespace    http://tampermonkey.net/
// @version      2021.08.17
// @description  The script helps to work with an applicant/employee profile
// @author       Vladislav Romanovsky
// @match        https://staffing.epam.com/applicant*/*
// @icon         https://www.google.com/s2/favicons?domain=epam.com
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_info
// @grant        GM_xmlhttpRequest
// @updateURL    https://github.com/FrostBy/anywhere/raw/master/profile.user.js
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.4.0/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/tooltipster/4.2.8/js/tooltipster.bundle.min.js
// @require      https://github.com/FrostBy/anywhere/raw/master/services/dom/dom.profile.js
// @require      https://github.com/FrostBy/anywhere/raw/master/services/dom/dom.shared.js
// @require      https://github.com/FrostBy/anywhere/raw/master/services/salary.js
// @require      https://github.com/FrostBy/anywhere/raw/master/services/version.js
// @require      https://github.com/FrostBy/anywhere/raw/master/services/config.js
// @require      https://github.com/FrostBy/anywhere/raw/master/profile.js
// @resource     IMPORTED_CSS_TOOLTIPSTER https://cdnjs.cloudflare.com/ajax/libs/tooltipster/4.2.8/css/tooltipster.bundle.min.css
// @resource     IMPORTED_CSS_SHARED https://github.com/FrostBy/anywhere/raw/master/css/shared.css
// @resource     IMPORTED_CSS https://github.com/FrostBy/anywhere/raw/master/css/profile.css
// ==/UserScript==

(() => {
    window.services = {
        Config,
        Salary,
        DomShared,
        Dom: DomProfile,
    };
    window.GM_setValue = GM_setValue;
    window.GM_getValue = GM_getValue;
    window.version = GM_info.script.version;
    window.updateURL = GM_info.script.updateURL;
    GM_addStyle(GM_getResourceText('IMPORTED_CSS_TOOLTIPSTER'));
    GM_addStyle(GM_getResourceText('IMPORTED_CSS_SHARED'));
    GM_addStyle(GM_getResourceText('IMPORTED_CSS'));
    (async () => { if (await Version.check()) initScript(); })();
})();