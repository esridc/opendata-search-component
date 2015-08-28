// polyfill Bbject.assign
if (!Object.assign) {
  Object.defineProperty(Object, 'assign', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function(target) {
      'use strict';
      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert first argument to object');
      }

      var to = Object(target);
      for (var i = 1; i < arguments.length; i++) {
        var nextSource = arguments[i];
        if (nextSource === undefined || nextSource === null) {
          continue;
        }
        nextSource = Object(nextSource);

        var keysArray = Object.keys(Object(nextSource));
        for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
          var nextKey = keysArray[nextIndex];
          var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
          if (desc !== undefined && desc.enumerable) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
      return to;
    }
  });
}

function elementMatchesSelector (element, selector) {
  if (element.matches) {
    return element.matches(selector);
  }

  if (element.matchesSelector) {
    return element.matchesSelector(selector);
  }
}

function query (selector, element = document) {
  return [].slice.call(element.querySelectorAll(selector));
}

var ItemRatingDefinition = Object.create(HTMLElement.prototype);

ItemRatingDefinition.createdCallback = function () {
  this.insertAdjacentHTML('afterbegin',
    '<span class="tooltip" aria-label="Poor">' +
      '<a href="#" data-rating="1" class="' + (this.rating > 1 ? 'icon-ui-blue' : '') + ' icon-ui-favorites link-gray"></a>' +
    '</span>' +
    '<span class="tooltip" aria-label="Fair">' +
      '<a href="#" data-rating="2" class="' + (this.rating > 2 ? 'icon-ui-blue' : '') + ' icon-ui-favorites link-gray"></a>' +
    '</span>' +
    '<span class="tooltip" aria-label="Average">' +
      '<a href="#" data-rating="3" class="' + (this.rating > 3 ? 'icon-ui-blue' : '') + ' icon-ui-favorites link-gray"></a>' +
    '</span>' +
    '<span class="tooltip" aria-label="Good">' +
      '<a href="#" data-rating="4" class="' + (this.rating > 4 ? 'icon-ui-blue' : '') + ' icon-ui-favorites link-gray"></a>' +
    '</span>' +
    '<span class="tooltip" aria-label="Great">' +
      '<a href="#" data-rating="5" class="' + (this.rating > 5 ? 'icon-ui-blue' : '') + ' icon-ui-favorites link-gray"></a>' +
    '</span>' +
    '<span class="numRatings">' + this.numRatings + ' Ratings</span>'
  );
};

ItemRatingDefinition.attachedCallback = function () {
  this.addEventListener('click', this.handleClick);
};

ItemRatingDefinition.detatchedCallback = function () {
  this.removeEventListener('click', this.handleClick);
};

ItemRatingDefinition.attributeChangedCallback = function(attribute, newValue, oldValue) {
  switch (attribute) {
    case 'num-ratings':
      this.updateNumRatings();
      break;

    case 'rating':
      this.updateRating();
      break;
  }
};

ItemRatingDefinition.handleClick = function (e) {
  // handle the click evend and update the rating
  if (elementMatchesSelector(e.target, 'a')) {
    var rating = parseFloat(e.target.getAttribute('data-rating'));
    this.rate(rating);
  }
};

ItemRatingDefinition.updateRating = function () {
  query('a', this).forEach(function (star) {
    var starRating = parseFloat(star.getAttribute('data-rating'));

    if (starRating < this.rating) {
      star.classList.add('icon-ui-blue');
    } else {
      star.classList.remove('icon-ui-blue');
    }
  });
};

ItemRatingDefinition.updateNumRatings = function () {
  query('.numRatings', this)[0].innerText = this.numRatings + ' Ratings';
};

ItemRatingDefinition.rate = function (rating) {
  console.log('Rate:', rating);
  this.dispatchEvent(new CustomEvent('rateitem', {
    bubbles: true,
    details: {
      rating: rating
    }
  }));
};

Object.defineProperty(ItemRatingDefinition, "itemId", {
  enumerable: true,
  get: function () {
    return this.getAttribute('item-id');
  },
  set: function (value) {
    return this.setAttribute('item-id', value);
  }
});

Object.defineProperty(ItemRatingDefinition, "rating", {
  enumerable: true,
  get: function () {
    return this.getAttribute('rating');
  },
  set: function (value) {
    return this.setAttribute('rating', value);
  }
});

Object.defineProperty(ItemRatingDefinition, "numRatings", {
  enumerable: true,
  get: function () {
    return this.getAttribute('num-ratings');
  },
  set: function (value) {
    return this.setAttribute('num-ratings', value);
  }
});

var ItemRatingElement = document.registerElement('item-rating', {
  prototype: ItemRatingDefinition
});

function ItemRating (attributes) {
  return Object.assign(new ItemRatingElement(), attributes);
};
