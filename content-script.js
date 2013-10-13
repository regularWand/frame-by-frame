/*
Injects frame-by-frame.js into YouTube page.

Content scripts are executed in an isolated environment, so to manipulate the player
need to execute script into the page.

http://stackoverflow.com/questions/9515704/building-a-chrome-extension-inject-code-in-a-page-using-a-content-script

https://developer.chrome.com/extensions/content_scripts.html#execution-environment
*/

var s = document.createElement('script');
s.src = chrome.extension.getURL("frame-by-frame.js");
s.onload = function() {
    this.parentNode.removeChild(this);
};
(document.head||document.documentElement).appendChild(s);