import elementMatchesSelector from '../util/elementMatchesSelector.js';

export default function bindEvent (events) {
  return function (target) {
    // replace the attachedCallback to bind our events
    let originalAttachedCallback = target.prototype.attachedCallback || function () {};
    target.prototype.attachedCallback = function () {
      this._boundEvents = [];

      for (let key of Object.keys(events)) {
        var [eventName, selector] = key.split('@');
        var useCapture = /focus|blur/.test(eventName);
        var handler = (e) => {
          if (!selector || (selector && elementMatchesSelector(e.target, selector))) {
            if (typeof events[key] === 'function') {
              return events[key].call(this, e);
            }

            if (this[events[key]]) {
              return this[events[key]].call(this, e);
            }
          }
        };

        this.addEventListener(eventName, handler, useCapture);
        this._boundEvents.push([eventName, handler]);
      }

      // call original function
      return originalAttachedCallback.call(this);
    };

    // replace the original detachedCallback
    let originalDetachedCallback = target.prototype.detachedCallback || function () {};
    target.prototype.detachedCallback = function () {
      this._boundEvents.forEach((e) => {
        this.removeEventListener.apply(this, e);
      });

      this._boundEvents = [];

      return originalDetachedCallback.call(this);
    };
  };
}
