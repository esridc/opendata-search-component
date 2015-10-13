// usage sendRequest('file.txt',handleRequest);

function sendRequest(url, callback, errback) {
  var xhr;
  if (window.XDomainRequest) xhr = new XDomainRequest();
  else if (window.XMLHttpRequest) xhr = new XMLHttpRequest();

  xhr.open('GET', encodeURI(url), true);
  xhr.responseType = 'json';
  xhr.onprogress = function() {}; // persuade ie to not abort
  xhr.ontimeout = function() {}; // persuade ie to not abort
  xhr.onload = function() {
    if (xhr.status === 200) {
      if (callback) {
        callback(xhr.response);
      }
    } else if (xhr.responseText) {
      callback(JSON.parse(xhr.responseText));
    }
    else {
      if (errback) {
        errback(xhr);
      }
    }
  };
  xhr.onerror = function() {
    errback(xhr);
  };

  xhr.send();
}

export default sendRequest;
