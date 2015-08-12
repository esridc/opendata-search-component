export default function log (target, name, descriptor) {
  let fn = descriptor.value;

  descriptor.value = function (...args) {
    console.log('Calling', name, 'with', args , 'in', this);
    try {
      let out = fn.apply(this, args);
      console.log('Got', out);
      return out;
    } catch (e) {
      console.log('Caught', e.message);
      throw e;
    }
  };
}
