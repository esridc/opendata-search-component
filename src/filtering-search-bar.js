import './suggestion.js'; // make sure we load suggestions too
import log from './logger.js'; // decorator

class FilteringSearchBar extends HTMLElement {
  @log
  createdCallback () {
    this.input = document.createElement('input');
    this.list = document.createElement('ul');
    this.appendChild(this.input);
    this.appendChild(this.list);
    this.suggestions = [].slice.call(this.querySelectorAll('filtering-search-bar-suggestion')).map((item) =>{
      return item.getAttribute('value');
    });
  }

  @log
  attachedCallback () {
    // called whenever an element is added to the DOM
    this.input.addEventListener('keypress', this.handleInput.bind(this));
    this.input.addEventListener('focus', this.handleInput.bind(this));
    this.input.addEventListener('input', this.handleInput.bind(this));
    this.input.addEventListener('blur', this.handleBlur.bind(this));
  }

  @log
  detachedCallback () {
    // called whenever an element is removed from the DOM
    this.input.removeEventListener('keypress', this.handleInput.bind(this));
    this.input.addEventListener('focus', this.handleInput.bind(this));
    this.input.removeEventListener('input', this.handleInput.bind(this));
    this.input.addEventListener('blur', this.handleBlur.bind(this));
  }

  @log
  attributeChangedCallback(attribute, oldValue, newValue) {
    // called whenever an attribute changes on an element
    console.log(attribute, oldValue, newValue);
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
