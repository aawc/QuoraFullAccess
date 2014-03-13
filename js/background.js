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

  /*
   * Add a listener function to each outgoing request. That way, when a request
   * that we are interested in is being made, we can cancel/modify it.
   */
  chrome.webRequest.onBeforeRequest.addListener(
      this.onBeforeRequest.bind(this),
      {urls: ['*://www.quora.com/*']},
      ['blocking']);
}


/**
 * Gets called every time the browser is about to send a web request out.
 * @this {QuoraFullAccess}
 * @param {chrome.webRequest.onBeforeRequest.Details} details An object,
 *     that among other things, contains an array of the header fields that will
 *     be sent out to the server.
 * @return {chrome.webRequest.BlockingResponse)}
 */
QuoraFullAccess.prototype.onBeforeRequest = function(details) {
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
 * Determine if the URL already contains the 'share' argument. If it is, we
 * don't need to add the argument again.
 * @this {QuoraFullAccess}
 * @param {Object.<String, String>} params A dictionary of GET parameters in the
 *  URL.
 * @return {boolean} Whether the GET argument list contains a non-empty 'share'
 *  argument
 */
QuoraFullAccess.prototype.isSharedAlready = function(params)
{
  var shareIndex = Object.keys(params).indexOf(this.SHARE_PARAMETER);
  return (shareIndex !== -1) && params[shareIndex];
}


var quoraFullAccess = new QuoraFullAccess();
