import log from './logger.js';

class Suggestion extends HTMLElement {

  createdCallback () {
    // called when the element is created
  }

  attachedCallback () {
    // called whenever an element is added to the DOM
    // this should probally reach up to its parent <filtering-search-bar>
    // and update it somehow
  }

  detachedCallback () {
    // called whenever an element is removed from the DOM
    // this should probally reach up to its parent <filtering-search-bar>
    // and update it somehow
  }

  attributeChangedCallback(attribute, oldValue, newValue) {
    // called whenever an attribute changes on an element
    // this should probally reach up to its parent <filtering-search-bar>
    // and update it somehow
  }

}

document.registerElement('filtering-search-bar-suggestion', Suggestion);
