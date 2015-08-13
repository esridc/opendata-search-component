# Custom Element Decorators

```js
@template(`
  <input type='search'>
  <ul></ul>
`)
@bindEvents({
  'blur@input[type="search"]': function (e) {}
  'focus@input[type="search"]': function (e) {}
}
@watchAttributes({
  limit: function (oldValue, newValue) {}
})
class MyCustomElement extends HTMLElement {
  createdCallback () {

  }

  attachedCallback () {

  }

  detachedCallback () {

  }

  attributeChangedCallback () {

  }
}

document.registerElement('my-custom-element', MyCustomElement);
```
