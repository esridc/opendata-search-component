// polls the element until the _iscreated property is true then calls the callback
function poller (element, callback) {
  if (element._iscreated) {
    callback();
    return;
  }
  window.setTimeout(function () { poller(element, callback); }, 20);
}

export default poller;
