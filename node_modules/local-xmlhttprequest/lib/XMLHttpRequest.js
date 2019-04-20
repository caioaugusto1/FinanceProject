/**
 * Wrapper for built-in http.js to emulate the browser XMLHttpRequest object.
 *
 * This can be used with JS designed for browsers to improve reuse of code and
 * allow the use of existing libraries.
 *
 * Usage: include("XMLHttpRequest.js") and use XMLHttpRequest per W3C specs.
 *
 * @author Dan DeFelippi <dan@driverdan.com>
 * @contributor David Ellis <d.f.ellis@ieee.org>
 * @license MIT
 */

require('array.prototype.find');
require('string.prototype.includes');

var Url = require("url")
  , spawn = require("child_process").spawn
  , fs = require('fs');

module.exports = function (cfg) {
  cfg = cfg || {};

  var http = require('http');
  var https = require('https');

  // Set some default headers
  var defaultHeaders = {
    "User-Agent": "node-XMLHttpRequest",
    "Accept": "*/*"
  };

  function XMLHttpRequest () {
    /**
     * Private variables
     */

    // Holds http.js objects
    // this._request;
    // this._response;

    // Request settings
    this._settings = {};

    // Disable header blacklist.
    // Not part of XHR specs.
    this._disableHeaderCheck = false;

    this._headers = defaultHeaders;

    // Send flag
    this._sendFlag = false;
    // Error flag, used when errors occur or abort is called
    this._errorFlag = false;

    // Event listeners
    this._listeners = {};

    /**
     * Constants
     */

    this.UNSENT = 0;
    this.OPENED = 1;
    this.HEADERS_RECEIVED = 2;
    this.LOADING = 3;
    this.DONE = 4;

    /**
     * Public vars
     */

    // Current state
    this.readyState = this.UNSENT;

    // default ready state change handler in case one is not set or is set late
    this.onreadystatechange = null;

    // Result & response
    this.responseText = "";
    this.responseXML = "";
    this.status = null;
    this.statusText = null;

    /**
     * Private methods
     */
  };

  // These headers are not user setable.
  // The following are allowed but banned in the spec:
  // * user-agent
  var forbiddenRequestHeaders = [
    "accept-charset",
    "accept-encoding",
    "access-control-request-headers",
    "access-control-request-method",
    "connection",
    "content-length",
    "content-transfer-encoding",
    "cookie",
    "cookie2",
    "date",
    "expect",
    "host",
    "keep-alive",
    "origin",
    "referer",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
    "via"
  ];

  /**
   * Check if the specified header is allowed.
   *
   * @param string header Header to validate
   * @return boolean False if not allowed, otherwise true
   */
  XMLHttpRequest.prototype._isAllowedHttpHeader = function(header) {
    return this._disableHeaderCheck || (header && forbiddenRequestHeaders.indexOf(header.toLowerCase()) === -1);
  };

  /**
   * Changes readyState and calls onreadystatechange.
   *
   * @param int state New state
   */
  XMLHttpRequest.prototype._setState = function(state) {
    var self = this;
    if (state === self.LOADING || self.readyState !== state) {
      self.readyState = state;

      if (self._settings.async || self.readyState < self.OPENED || self.readyState === self.DONE) {
        self.dispatchEvent("readystatechange");
      }

      if (self.readyState === self.DONE && !self._errorFlag) {
        self.dispatchEvent("load");
        // @TODO figure out InspectorInstrumentation::didLoadXHR(cookie)
        self.dispatchEvent("loadend");
      }
    }
  };

  // These request methods are not allowed
  var forbiddenRequestMethods = [
    "TRACE",
    "TRACK",
    "CONNECT"
  ];

  /**
   * Check if the specified method is allowed.
   *
   * @param string method Request method to validate
   * @return boolean False if not allowed, otherwise true
   */
  var isAllowedHttpMethod = function(method) {
    return (method && forbiddenRequestMethods.indexOf(method) === -1);
  };

  /**
   * Public methods
   */

  /**
   * Open the connection. Currently supports local server requests.
   *
   * @param string method Connection method (eg GET, POST)
   * @param string url URL for the connection.
   * @param boolean async Asynchronous connection. Default is true.
   * @param string user Username for basic authentication (optional)
   * @param string password Password for basic authentication (optional)
   */
  XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
    this.abort();
    this._errorFlag = false;

    // Check for valid request method
    if (!isAllowedHttpMethod(method)) {
      throw new Error("SecurityError: Request method not allowed");
    }

    this._settings = {
      "method": method,
      "url": url.toString(),
      "async": (typeof async !== "boolean" ? true : async),
      "user": user || null,
      "password": password || null
    };

    this._setState(this.OPENED);
  };

  /**
   * Disables or enables isAllowedHttpHeader() check the request. Enabled by default.
   * This does not conform to the W3C spec.
   *
   * @param boolean state Enable or disable header checking.
   */
  XMLHttpRequest.prototype.setDisableHeaderCheck = function(state) {
    this._disableHeaderCheck = state;
  };

  /**
   * Sets a header for the request.
   *
   * @param string header Header name
   * @param string value Header value
   */
  XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
    if (this.readyState !== this.OPENED) {
      throw new Error("INVALID_STATE_ERR: setRequestHeader can only be called when state is OPEN");
    }
    if (!this._isAllowedHttpHeader(header)) {
      console.warn('Refused to set unsafe header "' + header + '"');
      return;
    }
    if (this._sendFlag) {
      throw new Error("INVALID_STATE_ERR: send flag is true");
    }
    this._headers[header] = value;
  };

  /**
   * Gets a header from the server response.
   *
   * @param string header Name of header to get.
   * @return string Text of the header or null if it doesn't exist.
   */
  XMLHttpRequest.prototype.getResponseHeader = function(header) {
    if (typeof header === "string"
      && this.readyState > this.OPENED
      && this._response
      && this._response.headers
      && this._response.headers[header.toLowerCase()]
      && !this._errorFlag
    ) {
      return this._response.headers[header.toLowerCase()];
    }

    return null;
  };

  /**
   * Gets all the response headers.
   *
   * @return string A string with all response headers separated by CR+LF
   */
  XMLHttpRequest.prototype.getAllResponseHeaders = function() {
    if (this.readyState < this.HEADERS_RECEIVED || this._errorFlag) {
      return "";
    }
    var result = "";
    var i;
    for (i in this._response.headers) {
      if (this._response.headers.hasOwnProperty(i)) {
        // Cookie headers are excluded
        if (i !== "set-cookie" && i !== "set-cookie2") {
          result += i + ": " + this._response.headers[i] + "\r\n";
        }
      }
    }
    return result.substr(0, result.length - 2);
  };

  /**
   * Gets a request header
   *
   * @param string name Name of header to get
   * @return string Returns the request header or empty string if not set
   */
  XMLHttpRequest.prototype.getRequestHeader = function(name) {
    // @TODO Make this case insensitive
    if (typeof name === "string" && this._headers[name]) {
      return this._headers[name];
    }

    return "";
  };

  /**
   * Sends the request to the server.
   *
   * @param string data Optional data to send as request body.
   */
  XMLHttpRequest.prototype.send = function(data) {
    var self = this;
    if (this.readyState !== this.OPENED) {
      throw new Error("INVALID_STATE_ERR: connection must be opened before send() is called");
    }

    if (this._sendFlag) {
      throw new Error("INVALID_STATE_ERR: send has already been called");
    }

    var ssl = false, local = false;
    var url = Url.parse(this._settings.url);
    var host;

    function getStack () {
      var orig = Error.prepareStackTrace;
      Error.prepareStackTrace = function(_, stack) { return stack; };
      var err = new Error();
      Error.captureStackTrace(err, arguments.callee); // eslint-disable-line no-caller
      var stack = err.stack;
      Error.prepareStackTrace = orig;
      return stack;
    }

    // Determine the server
    switch (url.protocol) {
      case 'https:':
        ssl = true;
        // SSL & non-SSL both need host, no break here.
        /* falls through */
      case 'http:':
        host = url.hostname;
        break;

      case 'file:':
        local = true;
        break;

      case undefined:
      case null:
      case '':
        var stack = getStack();
        var path = require('path');
        var basePath = cfg.basePath || path.dirname(stack.reverse().find(function (item) {
          var filename = item.getFileName();
          var idx = filename.search(/[/\\]node_modules[/\\]/);
          if (idx === -1) { // Should be a user file, as a node executable like nodeunit ought to have node_modules in the path
            return true;
          }
          // Should be a user file because its last "node_modules" contains this XMLHttpRequest file (i.e., XMLHttpRequest is a dependency of some kind)
          if (__dirname.includes(filename.slice(0, idx))) {
            return true;
          }
          return false;
        }).getFileName());
        // var pathName = Url.resolve(basePath, this._settings.url); // We should support this instead if the config were relative to URL
        var pathName = path.resolve(basePath, this._settings.url);
        url = {pathname: pathName};
        local = true;
        break;

      default:
        throw new Error("Protocol not supported.");
    }

    // Load files off the local filesystem (file://)
    if (local) {
      if (this._settings.method !== "GET") {
        throw new Error("XMLHttpRequest: Only GET method is supported");
      }

      if (this._settings.async) {
        fs.readFile(url.pathname, 'utf8', function(error, data) {
          if (error) {
            self.handleError(error);
          } else {
            self.status = 200;
            self.responseText = data;
            self._setState(self.DONE);
          }
        });
      } else {
        try {
          this.responseText = fs.readFileSync(url.pathname, 'utf8');
          this.status = 200;
          this._setState(self.DONE);
        } catch (e) {
          this.handleError(e);
        }
      }

      return;
    }

    // Default to port 80. If accessing localhost on another port be sure
    // to use http://localhost:port/path
    var port = url.port || (ssl ? 443 : 80);
    // Add query string if one is used
    var uri = url.pathname + (url.search || '');

    // Set the Host header or the server may reject the request
    this._headers.Host = host;
    if (!((ssl && port === 443) || port === 80)) {
      this._headers.Host += ':' + url.port;
    }

    // Set Basic Auth if necessary
    if (this._settings.user) {
      if (this._settings.password === undefined) {
        this._settings.password = "";
      }
      var authBuf = Buffer.from(this._settings.user + ":" + this._settings.password);
      this._headers.Authorization = "Basic " + authBuf.toString("base64");
    }

    // Set content length header
    if (this._settings.method === "GET" || this._settings.method === "HEAD") {
      data = null;
    } else if (data) {
      this._headers["Content-Length"] = Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data);

      if (!this._headers["Content-Type"]) {
        this._headers["Content-Type"] = "text/plain;charset=UTF-8";
      }
    } else if (this._settings.method === "POST") {
      // For a post with no data set Content-Length: 0.
      // This is required by buggy servers that don't meet the specs.
      this._headers["Content-Length"] = 0;
    }

    var options = {
      host: host,
      port: port,
      path: uri,
      method: this._settings.method,
      headers: this._headers,
      agent: false
    };

    var doRequest;

    // Reset error flag
    this._errorFlag = false;

    // Error handler for the request
    function errorHandler(error) {
      self.handleError(error);
    }

    // Handler for the response
    function responseHandler(resp) {
      // Set response var to the response we got back
      // This is so it remains accessable outside this scope
      this._response = resp;
      // Check for redirect
      // @TODO Prevent looped redirects
      if (this._response.statusCode === 301 || this._response.statusCode === 302 || this._response.statusCode === 303 || this._response.statusCode === 307) {
        // Change URL to the redirect location
        this._settings.url = this._response.headers.location;
        url = Url.parse(this._settings.url);
        // Set host var in case it's used later
        host = url.hostname;
        // Options for the new request
        var newOptions = {
          hostname: url.hostname,
          port: url.port,
          path: url.path,
          method: this._response.statusCode === 303 ? 'GET' : this._settings.method,
          headers: this._headers
        };

        // Issue the new request
        this._request = doRequest(newOptions, responseHandler).on('error', errorHandler);
        this._request.end();
        // @TODO Check if an XHR event needs to be fired here
        return;
      }

      this._response.setEncoding("utf8");

      self._setState(self.HEADERS_RECEIVED);
      self.status = this._response.statusCode;

      this._response.on('data', function(chunk) {
        // Make sure there's some data
        if (chunk) {
          self.responseText += chunk;
        }
        // Don't emit state changes if the connection has been aborted.
        if (self._sendFlag) {
          self._setState(self.LOADING);
        }
      });

      this._response.on('end', function() {
        if (self._sendFlag) {
          // Discard the 'end' event if the connection has been aborted
          self._setState(self.DONE);
          self._sendFlag = false;
        }
      });

      this._response.on('error', function(error) {
        self.handleError(error);
      });
    }

    // Handle async requests
    if (this._settings.async) {
      // Use the proper protocol
      doRequest = ssl ? https.request : http.request;

      // Request is being sent, set send flag
      self._sendFlag = true;

      // As per spec, this is called here for historical reasons.
      self.dispatchEvent("readystatechange");

      // Create the request
      this._request = doRequest(options, responseHandler).on('error', errorHandler);

      // Node 0.4 and later won't accept empty data. Make sure it's needed.
      if (data) {
        this._request.write(data);
      }

      this._request.end();

      self.dispatchEvent("loadstart");
    } else { // Synchronous
      // Create a temporary file for communication with the other Node process
      var contentFile = ".node-xmlhttprequest-content-" + process.pid;
      var syncFile = ".node-xmlhttprequest-sync-" + process.pid;
      fs.writeFileSync(syncFile, "", "utf8");
      // The async request the other Node process executes
      var execString = "var http = require('http'), https = require('https'), fs = require('fs');"
        + "var doRequest = http" + (ssl ? "s" : "") + ".request;"
        + "var options = " + JSON.stringify(options) + ";"
        + "var responseText = '';"
        + "var req = doRequest(options, function(response) {"
        + "response.setEncoding('utf8');"
        + "response.on('data', function(chunk) {"
        + "  responseText += chunk;"
        + "});"
        + "response.on('end', function() {"
        + "fs.writeFileSync('" + contentFile + "', 'NODE-XMLHTTPREQUEST-STATUS:' + response.statusCode + ',' + responseText, 'utf8');"
        + "fs.unlinkSync('" + syncFile + "');"
        + "});"
        + "response.on('error', function(error) {"
        + "fs.writeFileSync('" + contentFile + "', 'NODE-XMLHTTPREQUEST-ERROR:' + JSON.stringify(error), 'utf8');"
        + "fs.unlinkSync('" + syncFile + "');"
        + "});"
        + "}).on('error', function(error) {"
        + "fs.writeFileSync('" + contentFile + "', 'NODE-XMLHTTPREQUEST-ERROR:' + JSON.stringify(error), 'utf8');"
        + "fs.unlinkSync('" + syncFile + "');"
        + "});"
        + (data ? "req.write('" + JSON.stringify(data).slice(1, -1).replace(/'/g, "\\'") + "');" : "")
        + "req.end();";
      // Start the other Node Process, executing this string
      var syncProc = spawn(process.argv[0], ["-e", execString]);
      while (fs.existsSync(syncFile)) {
        // Wait while the sync file is empty
      }
      self.responseText = fs.readFileSync(contentFile, 'utf8');
      // Kill the child process once the file has data
      syncProc.stdin.end();
      // Remove the temporary file
      fs.unlinkSync(contentFile);
      if (self.responseText.match(/^NODE-XMLHTTPREQUEST-ERROR:/)) {
        // If the file returned an error, handle it
        var errorObj = self.responseText.replace(/^NODE-XMLHTTPREQUEST-ERROR:/, "");
        self.handleError(errorObj);
      } else {
        // If the file returned okay, parse its data and move to the DONE state
        self.status = parseInt(self.responseText.replace(/^NODE-XMLHTTPREQUEST-STATUS:([0-9]*),.*/, "$1"), 10);
        self.responseText = self.responseText.replace(/^NODE-XMLHTTPREQUEST-STATUS:[0-9]*,(.*)/, "$1");
        self._setState(self.DONE);
      }
    }
  };

  /**
   * Called when an error is encountered to deal with it.
   */
  XMLHttpRequest.prototype.handleError = function(error) {
    this.status = 503;
    this.statusText = error;
    this.responseText = error.stack;
    this._errorFlag = true;
    this._setState(this.DONE);
  };

  /**
   * Aborts a request.
   */
  XMLHttpRequest.prototype.abort = function() {
    if (this._request) {
      this._request.abort();
      this._request = null;
    }

    this._headers = defaultHeaders;
    this.responseText = "";
    this.responseXML = "";

    this._errorFlag = true;

    if (this.readyState !== this.UNSENT
        && (this.readyState !== this.OPENED || this._sendFlag)
        && this.readyState !== this.DONE) {
      this._sendFlag = false;
      this._setState(this.DONE);
    }
    this.readyState = this.UNSENT;
  };

  /**
   * Adds an event listener. Preferred method of binding to events.
   */
  XMLHttpRequest.prototype.addEventListener = function(event, callback) {
    if (!(this._listeners.hasOwnProperty(event))) {
      this._listeners[event] = [];
    }
    // Currently allows duplicate callbacks. Should it?
    this._listeners[event].push(callback);
  };

  /**
   * Remove an event callback that has already been bound.
   * Only works on the matching funciton, cannot be a copy.
   */
  XMLHttpRequest.prototype.removeEventListener = function(event, callback) {
    if (this._listeners.hasOwnProperty(event)) {
      // Filter will return a new array with the callback removed
      this._listeners[event] = this._listeners[event].filter(function(ev) {
        return ev !== callback;
      });
    }
  };

  /**
   * Dispatch any events, including both "on" methods and events attached using addEventListener.
   */
  XMLHttpRequest.prototype.dispatchEvent = function(event) {
    var self = this;
    if (typeof self["on" + event] === "function") {
      self["on" + event]();
    }
    var i, len;
    if (this._listeners.hasOwnProperty(event)) {
      for (i = 0, len = this._listeners[event].length; i < len; i++) {
        this._listeners[event][i].call(self);
      }
    }
  };

  return XMLHttpRequest;
};
