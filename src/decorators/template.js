import stringToDom from '../util/stringToDom.js';

export default function template (templateString) {
  return function (target) {
    let template = stringToDom(templateString);
    let originalCreatedCallback = target.prototype.createdCallback || function () {};
    target.prototype.createdCallback = function () {
      this.appendChild(template);
      return originalCreatedCallback.call(this);
    };
  };
}
