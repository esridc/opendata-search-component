// import polyfills
import 'custom-event';
import 'document-register-element';
import 'core-js/shim';

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
      <span class="numRatings">${this.numRatings} Ratings</span>
    `);
  }

  // called whenever an element is added to the DOM
  // events should be attached here
  attachedCallback () {
    this.addEventListener('click', this.handleClick);
  }

  // called when the dom elemnt is removed from the DOM
  // events should be removed here
  detachedCallback () {
    this.removeEventListener('click', this.handleClick);
  }

  // called whenever an attribute changes on an element
  attributeChangedCallback (attribute, oldValue, newValue) {
    switch (attribute) {
      case 'num-ratings':
        this.updateNumRatings();
        break;

      case 'rating':
        this.updateRating();
        break;
    }
  }

  // define a getter and setter that maps the `item-id` attribute to an `itemId` property on the element
  get itemId () {
    return this.getAttribute('item-id');
  }

  set itemId (id) {
    this.setAttribute('item-id', id);
  }

  // define a getter and setter that maps the `rating` attribute to an `rating` property on the element
  get rating () {
    return parseFloat(this.getAttribute('rating'));
  }

  set rating (rating) {
    this.setAttribute('rating', rating);
  }

  // define a getter and setter that maps the `num-ratings` attribute to an `numRatings` property on the element
  get numRatings () {
    return parseFloat(this.getAttribute('num-ratings'));
  }

  set numRatings (numRatings) {
    this.setAttribute('num-ratings', numRatings);
  }

  // update the rating of this item
  rate (rating) {
    console.log('Rate:', rating);
    this.dispatchEvent(new CustomEvent('rateitem', {
      bubbles: true,
      detail: {
        rating: rating
      }
    }));
    // update the rating via the api
    // this.rating = newRating; with the new average rating
    // this.numRating = newNumRatings; with the new rating count
    // this.dispatchEvent(new CustomEvent('ratingupdated', {rating: 5})); fire an eveng with the new rating
  }

  // handle the click evend and update the rating
  handleClick (e) {
    if (elementMatchesSelector(e.target, 'a')) {
      var rating = parseFloat(e.target.getAttribute('data-rating'));
      this.rate(rating);
    }
  }

  // update the stars
  updateRating () {
    query('a', this).forEach((star) => {
      var starRating = parseFloat(star.getAttribute('data-rating'));

      if (starRating < this.rating) {
        star.classList.add('icon-ui-blue');
      } else {
        star.classList.remove('icon-ui-blue');
      }
    });
  }

  // update the count of ratings displayed next to the start
  updateNumRatings () {
    query('.numRatings', this)[0].innerText = this.numRatings + ' Ratings';
  }
}

var ItemRatingElement = document.registerElement('item-rating', ItemRating);

export default function (attributes) {
  return Object.assign(new ItemRatingElement(), attributes);
}
