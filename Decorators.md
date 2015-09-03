# Custom Element Decorators

## `@bindEvent`

Adds an event listener on this element. Uses bubbling/capturing combined with `Element.matches(selector)`.

```js
@bindEvent('click', 'a', 'handleClick')
class MyElement extends HTMLElement {
  // ...
  handleClick (e) {
    // ...
  }
}
```

```js
export default function bindEvent (event, selector, handler) {
  var callback;
  return function(target) {
    var attachedCallback = target.prototype.attachedCallback || new Function();
    target.prototype.attachedCallback = function {
      var callback = (e) => {
        if(e.target.matches(selector)) {
          this[handler].call(this, e);
        }
      }
      this.addEventListener(event, callback, /focus|blur/.test(eventName));
      orginalAttachedCallback();
    }

    var detachedCallback = target.prototype.detachedCallback || new Function();
    target.prototype.detachedCallback = function {
      this.removeEventListener(event, callback);
      orginalAttachedCallback();
    }
  }

}
```

## `@watchAttribute`

Adds a handler for watching a specific attribute.

```js
@watchAttribute('size', 'handleSizeChange')
class MyElement extends HTMLElement {
  // ...
  handleSizeChange (oldValue, newValue) {
    // ...
  }
}
```

```js
export default function watchAttribute (attribute, handler) {
  return function (target) {
    var attributeChangedCallback = target.prototype.attributeChangedCallback || new Function();  
    target.prototype.attributeChangedCallback = function (attribute, oldValue, newValue) {
      if(attribute === attribute) {
        this[handler].call(this, oldValue, newValue);
      }
      attributeChangedCallback();
    }
  }
}
```

```js
// impossible without a full template library
// due to this way ES 6 template strings work
```

## `@attribute`

Create getters and setters for HTML attributes.

Todos

* Error handling
* Name validation (only a-z allowed)

```js
@attribute('editing', Boolean)
@attribute('rating', Number)
@attribute('created', Date)
@attribute('color', String)
class MyElement extends HTMLElement {
 // ...
}
```

```js
function getter (name, type) {
  switch (type) {
    case Boolean:
      return function () {
        return this.hasAttribute(name);
      }
    case Number:
      return function () {
        return parseFloat(this.getAttribute(name), 10);
      }
    case Date:
      return function () {
        return Date.parse(this.getAttribute(name));
      }
    default:
      return function () {
        return this.getAttribute(name);
      }
  }
}

function setter (name, type) {
  switch (type) {
    case Boolean:
      return function (value) {
        (value) ? this.setAttribute(name, name) : this.removeAttribute(name);
      }
    case Date:
      return function (value) {
        this.setAttribute(name, value.toISOString());
      }
    default:
      return function () {
        this.setAttribute(name, value);
      }
  }
}

export default function attribute (name, type) {
  return function (target) {
    Object.defineProperty(target.prototype, "name", {
      enumerable: true,
      get: getter(name, type),
      set: setter(name, type)
    });
  }
}
```

## `@Accessor`

Implements the JS API 4.0 `get()`, `set()`, `watch()` Accessor methods for any attributes on this element.

Todo

* `set()` should trigger watchers
* Computed properties
* Error handling
* Dispatch change event
* API complete?

```js
@Accessor()
class MyElement extends HTMLElement {
 // ...
}
```

```js
export default function () {
  var watches = {
    '*': []
  };

  function (target) {
    // JS API 4.0 equivalent for Accessor.get
    // but using native getters/setters since we are in IE 9+ land
    target.prototype.get = function (name) {
      return this[name]; // call the getter
    }

    // JS API 4.0 equivalent for Accessor.set
    // but using native getters/setters since we are in IE 9+ land
    target.prototype.set = function (name, value) {
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
    target.prototype.watch = function (name, callback) {
      // .watch('prop', callback)
      if (arguments.length === 2) {
        watches[name] = watches[name] || [];
        watches[name].push(callback);
      }

      // .watch(callback)
      if (arguments.length === 1) {
        watches['*'] = watches['*'] || [];
        watches['*'].push(name);
      }
    }

    target.prototype.attributeChangedCallback = function (attribute, oldValue, newValue) {
      // concat global listeners with prop specific listeners
      var watchers = watches['*'].concat((watches[attribute].length) ? watches[attribute] : []);

      for (var x = 0; x < watchers.length; x++) {
        watches[x]({
          name: attribute,
          newValue,
          oldValue
        });
      }
    }
  }
}
```

## `<item-rating>` with decorators

```js

// import decorators
import attribute from './decorators/template.js';
import bindEvent from './decorators/bindEvents.js';
import watchAttribute from './decorators/watchAttributes.js';
import Accessor form './decorators/Accessor.js';

@attribute('itemid', String)
@attribute('rating', Number)
@attribute('numratings', Number)
@bindEvent('click', 'a', 'handleStarClick')
@watchAttribute('rating', 'updateRating')
@watchAttribute('numratings', 'updateNumRatings')
@Accessor()
class ItemRating extends HTMLElement {

  // called when the element is first created
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
    this.starElements = this.querySelectorAll('a');
    this.numRatingElement = this.querySelector('.numRatings');
  }

  // update the rating of this item
  rate (rating) {
    this.dispatchEvent(new CustomEvent('rateitem', {
      bubbles: true,
      details: {
        rating: rating
      }
    }));
  }

  // handle the click event and update the rating
  handleClick (e) {
    var rating = parseFloat(e.target.getAttribute('data-rating'));
    this.rate(rating);
  }

  // update the stars to reflect the rating
  updateRating () {
    for (let star of this.starElements) {
      var starRating = parseFloat(star.getAttribute('data-rating'));

      // ideally we would also polyfill classList for a better API
      // https://developer.mozilla.org/en-US/docs/Web/API/Element/classList#JavaScript_shim_for_other_implementations
      if (starRating < this.rating) {
        star.className = 'icon-ui-blue icon-ui-favorites link-gray';
      } else {
        star.className = 'icon-ui-favorites link-gray';
      }      
    }
  }

  // update the count of ratings displayed next to the stars
  updateNumRatings () {
    this.numRatingElement.textContent = this.numratings + ' Ratings';
  }
}

var ItemRatingElement = document.registerElement('item-rating', ItemRating);

export default function (attributes) {
  return Object.assign(new ItemRatingElement(), attributes);
}
```

## Other uses of decorators

We could also use decorators to generate metadata that could Automate the integration of our custom Elements for things like Ember 2.0 and Angular 1.0 or even declare Dijit wrappers for our custom elements.

```js
@attribute('itemid', String)
@attribute('rating', Number)
@attribute('numratings', Number)
@bindEvent('click', 'a', 'handleStarClick')
@watchAttribute('rating', 'updateRating')
@watchAttribute('numratings', 'updateNumRatings')
@emitsEvent('rateitem')
@Accessor()
class ItemRating extends HTMLElement {
  // ...
}
```

```js
export function default emitsEvent (event) {
  return function (target) {
    target.Events = (target.Events || []).push(event);
  }
}
````

Now we have `ItemRating.Attributes` and `ItemRating.Events` that we can use to generate the appropriate helpers.
