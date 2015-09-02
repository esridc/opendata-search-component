/* global HTMLElement CustomEvent */

// import polyfills
import 'core-js/shim';
import 'document-register-element/build/document-register-element.max.js';
import './polyfills/custom-event';
import './polyfills/html-element.js';

// import utils
import elementMatchesSelector from './util/elementMatchesSelector.js';
import query from './util/query.js';

class ItemRating extends HTMLElement {

  // called when the element is first created but after constructor
  createdCallback () {
    // insert the HTML structure of this widget
    // note the interpolation of the initial state here
    this.insertAdjacentHTML('afterbegin', `
      <span class="tooltip" aria-label="Poor">
        <a href="#" data-rating="1" class="${this.rating > 1 ? 'icon-ui-blue' : ''} icon-ui-favorites link-gray"></a>
      </span>
      <span class="tooltip" aria-label="Fair">
        <a href="#" data-rating="2" class="${this.rating > 2 ? 'icon-ui-blue' : ''} icon-ui-favorites link-gray"></a>
      </span>
      <span class="tooltip" aria-label="Average">
        <a href="#" data-rating="3" class="${this.rating > 3 ? 'icon-ui-blue' : ''} icon-ui-favorites link-gray"></a>
      </span>
      <span class="tooltip" aria-label="Good">
        <a href="#" data-rating="4" class="${this.rating > 4 ? 'icon-ui-blue' : ''} icon-ui-favorites link-gray"></a>
      </span>
      <span class="tooltip" aria-label="Great">
        <a href="#" data-rating="5" class="${this.rating > 5 ? 'icon-ui-blue' : ''} icon-ui-favorites link-gray"></a>
      </span>
      <span class="numRatings">${this.numratings} Ratings</span>
    `);

    // now that we have a DOM we can query it and save references to those nodes
    this.starElements = query('a', this);
    this.numRatingElement = query('.numRatings', this)[0];

    // setup an object to hold .watches('prop', callback) listeners
    this._watches = {
      '*': []
    };
  }

  // called whenever an element is added to the DOM
  // events should be attached here
  attachedCallback () {
    // instead of listening for click events on individual stars it is
    // better to use delegation becuse it keeps the `this` reference the same
    // and make it easy to remove the listener later
    this.addEventListener('click', this.handleClick);
  }

  // called when the element is removed from the DOM
  // events should be removed here
  detachedCallback () {
    this.removeEventListener('click', this.handleClick);
  }

  // called whenever an attribute changes on an element
  attributeChangedCallback (attribute, oldValue, newValue) {
    this._watches[attribute] = this._watches[attribute] || [];

    // do we have listeners registered with .watch('prop', callback)
    if (this._watches[attribute].length) {
      for (var i = 0; i < this._watches[attribute].length; i++) {
        this._watches[attribute][i]({
          name: attribute,
          newValue,
          oldValue
        });
      }
    }

    // do we have global listeners registered with .watch(callback)?
    if (this._watches['*'].length) {
      for (var x = 0; x < this._watches[attribute].length; x++) {
        this._watches['*'][x]({
          name: attribute,
          newValue,
          oldValue
        });
      }
    }

    // we can fire an event here if we want to listen for changes
    this.dispatchEvent(new CustomEvent('attributechanged', {
      bubbles: true,
      detail: {
        attribute,
        newValue,
        oldValue
      }
    }));

    // and we can bind custom behavior when attributes change
    switch (attribute) {
      case 'numratings':
        this.updateNumRatings();
        break;

      case 'rating':
        this.updateRating();
        break;

      case 'itemid':
        break;
    }
  }

  // JS API 4.0 equivalent for Accessor.get
  // but using native getters/setters since we are in IE 9+ land
  get (name) {
    return this[name]; // call the getter
  }

  // JS API 4.0 equivalent for Accessor.set
  // but using native getters/setters since we are in IE 9+ land
  set (name, value) {
    // set('prop', value)
    if (arguments.length === 2) {
      this[name] = value; // call the setter
    }

    // set({ ... })
    if (arguments.length === 1) {
      for (let key of name) {
        this[key] = name[key]; // call each setter in a loop
      }
    }
  }

  // JS API 4.0 equivalent for Accessor.watch
  watch (name, callback) {
    // .watch('prop', callback)
    if (arguments.length === 2) {
      this._watches[name] = this._watches[name] || [];
      this._watches[name].push(callback);
    }

    // .watch(callback)
    if (arguments.length === 1) {
      this._watches['*'] = this._watches['*'] || [];
      this._watches['*'].push(name);
    }
  }

  // dom attributes also map to properties on the object
  // so we need to define a getter/setter pair for each of our
  // attributes, this is neccessary for frameworks like Aurelia
  // which expect custom elements to exactly mimic DOM elements
  // it also will make the programatic API easier
  get rating () {
    return parseFloat(this.getAttribute('rating'));
  }

  set rating (rating) {
    this.setAttribute('rating', rating);
  }

  get numratings () {
    console.log('getter', this.getAttribute('numratings'));
    return parseFloat(this.getAttribute('numratings'));
  }

  set numratings (numratings) {
    this.setAttribute('numratings', numratings);
  }

  get itemid () {
    return this.getAttribute('itemid');
  }

  set itemid (itemid) {
    this.setAttribute('itemid', itemid);
  }

  // update the rating of this item
  rate (rating) {
    // fire an event, we can listen to the event to hook the component up to the API
    this.dispatchEvent(new CustomEvent('rateitem', {
      bubbles: true,
      detail: {
        rating: rating
      }
    }));

    // alternately this is where we could integrate the JS API directly
    // however this creates a tight coupling that makes distribution harder
    // require([
    //   'esri/request'
    // ], function(request){
    //   ...
    // });

    // once we know the new rating and number of ratings we can just
    // set them and the UI will update
    // this.rating = newRating; with the new average rating
    // this.numrating = newNumRatings; with the new rating count
  }

  // handle the click event from a start and update the rating
  handleClick (e) {
    // figure out if we clicked on an anchor tag, since the event is bubbling
    // up we do not have to check if the event target is a child of this element
    if (elementMatchesSelector(e.target, 'a')) {
      var rating = parseFloat(e.target.getAttribute('data-rating'));
      this.rate(rating);
    }
  }

  // update the stars to reflect the rating
  updateRating () {
    this.starElements.forEach((star) => {
      var starRating = parseFloat(star.getAttribute('data-rating'));

      if (starRating < this.rating) {
        star.classList.add('icon-ui-blue');
      } else {
        star.classList.remove('icon-ui-blue');
      }
    });
  }

  // update the count of ratings displayed next to the stars
  updateNumRatings () {
    this.numRatingElement.textContent = this.numratings + ' Ratings';
  }
}

// now we register our element with the DOM this returns a constructor function
// that we can use to build a nice programatic API
var ItemRatingElement = document.registerElement('item-rating', ItemRating);

// now we export a programatic API from this module that
// will merge a set of initial attributes into our element
export default function (attributes) {
  var element = new ItemRatingElement();
  return Object.assign(element, attributes);
}
