// usage sendRequest('file.txt',handleRequest);



//I think something like this would actually work on all browsers we support
function sendRequest(url, callback, errback) {
  var xhr;
  if (window.XDomainRequest) xhr = new XDomainRequest();
  else if (window.XMLHttpRequest) xhr = new XMLHttpRequest();
  else xhr = new ActiveXObject("Microsoft.XMLHTTP");
debugger;
  xhr.open('GET', encodeURI(url));
  xhr.responseType = 'json';
  xhr.onload = function(foo) {
    if (xhr.status === 200) {
      if (callback) {
        callback(xhr.response);
      }
    }
    else {
      if (errback) {
        errback(xhr);
      }
    }
  };
  xhr.send();
}



//
// function sendRequest(url, callback) {
//     var req = createXMLHTTPObject();
//     if (!req) return;
//
//     var method = "GET";
//
//     req.open(method, url, true);
//     req.responseType = 'json';
//     req.setRequestHeader('Content-type','application/json');
//
//     req.onreadystatechange = function () {
//         if (req.readyState != 4) return;
//         if (req.status != 200 && req.status != 304) {
// //          alert('HTTP error ' + req.status);
//             return;
//         }
//         callback(req);
//     }
//
//     if (req.readyState == 4) return;
//
//     req.send();
// }
//
// var XMLHttpFactories = [
//     function () {return new XMLHttpRequest()},
//     function () {return new ActiveXObject("Msxml2.XMLHTTP")},
//     function () {return new ActiveXObject("Msxml3.XMLHTTP")},
//     function () {return new ActiveXObject("Microsoft.XMLHTTP")}
// ];
//
// function createXMLHTTPObject() {
//     var xmlhttp = false;
//     for (var i=0;i<XMLHttpFactories.length;i++) {
//         try {
//             xmlhttp = XMLHttpFactories[i]();
//         }
//         catch (e) {
//             continue;
//         }
//         break;
//     }
//     return xmlhttp;
// }

export default sendRequest;
