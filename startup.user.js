// ==UserScript==
// @name         Startup
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://staffing.epam.com/positions/153695794/proposals
// @icon         https://www.google.com/s2/favicons?domain=epam.com

// @grant        GM_getResourceText
// @grant        GM_addStyle

// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.4.0/jquery.min.js
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.4.0/startup.js
// @resource     IMPORTED_CSS http://cdn.abc.com/startup.css
// ==/UserScript==

(function() { GM_addStyle(GM_getResourceText('IMPORTED_CSS'));})();