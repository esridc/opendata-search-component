export default function stringToDom (tagString) {
  var dom;

  // standards land (IE 11+, FF, Chrome, Safari)
  if (document.createRange) {
    var range = document.createRange();
    range.selectNode(document.body);
    return range.createContextualFragment(tagString);
  }

  // try non-standard IE behavior (IE 9, IE 10)
  try {
    dom = document.createElement(tagString);
  } catch (e) {
    // general catch all, this is what most libraries do
    var div = document.createElement('div');
    div.innerHTML = tagString;
    dom = div.childNodes;
  }

  return dom;
}
