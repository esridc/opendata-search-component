function query (selector, element = document) {
  return [].slice.call(element.querySelectorAll(selector));
}

export default query;
