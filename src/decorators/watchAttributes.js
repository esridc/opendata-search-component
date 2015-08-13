export default function (attributes) {
  return function (target) {
    let originalAttributeChangedCallback = target.prototype.attributeChangedCallback || function () {};
    target.prototype.attributeChangedCallback = function (attr, newValue, oldValue) {
      var handler = attributes[attr];

      if (handler) {
        if (typeof handler === 'function') {
          return handler.call(this);
        }

        if (this[handler]) {
          return this[handler].call(this);
        }
      }

      return originalAttributeChangedCallback.call(this, attr, newValue, oldValue);
    };
  };
}
