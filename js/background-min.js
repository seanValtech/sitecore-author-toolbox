"use strict";var lastTabId=0;chrome.tabs.onSelectionChanged.addListener((function(e){lastTabId=e})),chrome.runtime.onInstalled.addListener((function(){chrome.declarativeContent.onPageChanged.removeRules(void 0,(function(){chrome.declarativeContent.onPageChanged.addRules([{conditions:[new chrome.declarativeContent.PageStateMatcher({pageUrl:{urlContains:"/sitecore/"}})],actions:[new chrome.declarativeContent.ShowPageAction]}])}))}));