import './suggestion.js'; // make sure we load suggestions too
import log from './logger.js'; // decorator
import template from './decorators/template.js';
import bindEvents from './decorators/bindEvents.js';
import watchAttributes from './decorators/watchAttributes.js';

@template(`
  <input type="search" />
  <ul></ul>
`)
@bindEvents({
  'keypress@input': 'handleInput',
  'focus@input': 'handleInput',
  'input@input': 'handleInput',
  'blur@input': function (e) {
    this.querySelector('ul').innerHTML = '';
  }
})
@watchAttributes({
  limit: function(newValue, oldValue) {
    console.log('limit changed');
  }
})
class FilteringSearchBar extends HTMLElement {
  createdCallback () {
    this.suggestions = [].slice.call(this.querySelectorAll('filtering-search-bar-suggestion')).map((item) =>{
      return item.getAttribute('value');
    });
  }

  attachedCallback () {
    // called whenever an element is added to the DOM

  }

  detachedCallback () {
    // called whenever an element is removed from the DOM

  }

  attributeChangedCallback(attribute, oldValue, newValue) {
    // called whenever an attribute changes on an element
  }

  handleInput (e) {
    var filter = new RegExp(this.input.value, 'i');
    this.list.innerHTML = this.suggestions
    .filter((suggestion) => { return filter.test(suggestion); })
    .map((item) => { return `<li>${item}</li>`; })
    .slice(0, parseFloat(this.getAttribute('limit') || Infinity))
    .join('');
  }
}

document.registerElement('filtering-search-bar', FilteringSearchBar);
