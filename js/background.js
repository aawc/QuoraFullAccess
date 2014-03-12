/**
 * @fileoverview Background javascript for Quora Full Access.
 * @author khaneja+qfa@gmail.com (Varun Khaneja)
 */

'use strict';


/**
 * @constructor
 */
function QuoraFullAccess() {
  /*
   * @const{Array.Regex}
   * The list of pathname prefixes that need to be ignored when adding the
   * 'share' argument to the URLs.
   */
  this.PATHNAMES_TO_IGNORE = [
    /\/ *$/,
    /\/ajax.*/,
    /\/e2e.*/,
    /\/webnode2.*/
  ];

  /*
   * @const{String}
   * The name of the GET argument for sharing on Quora.
   */
  this.SHARE_PARAMETER = 'share';

  /**
   * A function binding onBeforeRequestCallback to this QuoraFullAccess object.
   */
  this.onBeforeRequest = this.onBeforeRequestCallback.bind(this);

  var that = this;
  /**
   * Iterate over all current windows and start listening to web requests in
   * them.
   */
  chrome.windows.getAll(
      function(windows) {
        for (var index in windows) {
          var aWindow = windows[index];
          that.onBeforeRequestForWindow(aWindow);
        }
      });

  /**
   * If any window is created, start listening to web requests from that window.
   */
  chrome.windows.onCreated.addListener(
      function(aWindow) {
        that.onBeforeRequestForWindow(aWindow);
      });
}


/**
 * Gets called every time the browser is about to send a web request out.
 * @this {QuoraFullAccess}
 * @param {chrome.webRequest.onBeforeRequest.Details} details An object,
 *     that among other things, contains an array of the header fields that will
 *     be sent out to the server.
 * @return {chrome.webRequest.BlockingResponse)}
 */
QuoraFullAccess.prototype.onBeforeRequestCallback = function(details) {
  var anchorElement = this.getElementFromUrl(details.url)
  if (this.ignoreRequest(anchorElement)) {
    return;
  }

  var params = this.getParamsFromElement(anchorElement);
  if (!this.isSharedAlready(params))
  {
    params[this.SHARE_PARAMETER] = 1;
    var paramsArray = Object.keys(params).reduce(
        function(previousValue, currentValue, index, array){
          var key = encodeURIComponent(currentValue);
          var value = encodeURIComponent(params[currentValue]);
          previousValue.push(key + '=' + value)
          return previousValue;
        }, []);
    var paramsString = paramsArray.join('&');
    anchorElement.search = paramsString;
    return {redirectUrl: anchorElement.href};
  }
};


/**
 * Sets up a listener for the OnBeforeRequest event for a window.
 * This way, we can modify the URL for any requests to Quora so that the nagging
 * login widget doesn't appear.
 * @this {QuoraFullAccess}
 * @param {Window} aWindow An existing or newly created window.
 */
QuoraFullAccess.prototype.onBeforeRequestForWindow = function(aWindow) {
  chrome.webRequest.onBeforeRequest.addListener(
      this.onBeforeRequest,
      {urls: ['*://www.quora.com/*'], windowId: aWindow.id},
      ['blocking']);
};


/**
 * TODO
 * @this {QuoraFullAccess}
 * @param {Window} aWindow An existing or newly created window.
 */
QuoraFullAccess.prototype.getElementFromUrl = function(url)
{
  var anchorElement = document.createElement('a');
  anchorElement.href = url;
  return anchorElement;
}


/**
 * TODO
 * @this {QuoraFullAccess}
 * @param {Window} aWindow An existing or newly created window.
 */
QuoraFullAccess.prototype.getPathnameFromUrl = function(url)
{
  return this.getElementFromUrl(url).pathname;
}


/**
 * TODO
 * @this {QuoraFullAccess}
 * @param {Window} aWindow An existing or newly created window.
 */
QuoraFullAccess.prototype.ignoreRequest = function(element)
{
  var pathname = element.pathname;
  for (var i = 0; i < this.PATHNAMES_TO_IGNORE.length; i++) {
    var pathnameRegexToIgnore = this.PATHNAMES_TO_IGNORE[i];
    if (pathname.match(pathnameRegexToIgnore)) {
      return true;
    }
  }
  return false;
}


/**
 * TODO
 * @this {QuoraFullAccess}
 * @param {Window} aWindow An existing or newly created window.
 */
QuoraFullAccess.prototype.getParamsFromElement = function(element)
{
  var params = {}
  if (element.search && element.search.length > 1) {
    var parts = element.search.substring(1);
    var vars = parts.split('&');
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      var key = decodeURIComponent(pair[0]);
      var value = decodeURIComponent(pair[1] ? pair[1] : '');
      params[key] = value;
    }
  }

  return params;
}


/**
 * TODO
 * @this {QuoraFullAccess}
 * @param {Window} aWindow An existing or newly created window.
 */
QuoraFullAccess.prototype.isSharedAlready = function(params)
{
  return Object.keys(params).indexOf(this.SHARE_PARAMETER) !== -1;
}


var quoraFullAccess = new QuoraFullAccess();
