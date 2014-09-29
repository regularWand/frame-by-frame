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

injectFont = function() {
    //inject the custom font for controls
    //http://stackoverflow.com/questions/4535816/how-to-use-font-face-on-a-chrome-extension-in-a-content-script
    //other css and font files are not loaded
    var fa = document.createElement('style');
    fa.type = 'text/css';
    fa.textContent = '@font-face { font-family: youtube-controls; src: url("'
            + chrome.extension.getURL('font/youtube-controls.woff')
            + '"); }';
    document.head.appendChild(fa);
}

injectFont();