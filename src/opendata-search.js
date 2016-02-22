/* global HTMLElement CustomEvent */

// import polyfills
import 'core-js/shim';
import 'document-register-element';
import './polyfills/custom-event.js';
import './polyfills/html-element.js';

// import utils
import query from './util/query.js';
import xhr from './util/xhr.js';
import tmpl from './util/tmpl.js';

class OpendataSearch extends HTMLElement {

  // called when the element is first created but after constructor
  createdCallback () {
    // defaults
    this.api = this.api === '/' ? 'http://opendata.arcgis.com' : this.api;
    this.q = (this.q === undefined || this.q === '') ? '*' : this.q;
    this.limit = this.limit || 10;
    this.sort = this.sort || ''; //use api default
    this.group = this.group || '';
    this.fields = this.fields || '';

    this.injectCSS();
    this.injectHTML();

    //for testing since the document.createElement polyfill is async
    this._iscreated = true;
  }

  /*
    insert base styles
  */
  injectCSS () {
    // note - the scoped attribute will not work in most browsers
    this.insertAdjacentHTML('afterbegin', `
      <style scoped>
        opendata-search .od-search-results {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        opendata-search .od-search-results-item {
          padding: 5px;
        }
        opendata-search .od-search-results-item a {
          margin: 0;
        }
      <style>
    `);
  }

  /*
    insert the HTML structure of this element if it was not provided
  */
  injectHTML () {
    if (query('form input', this).length === 0) {
      this.insertAdjacentHTML('beforeend', `
        <form>
          <input type="search">
          <button type="submit">Search</button>
        </form>
      `);
    }

    if (query('.od-search-results', this).length === 0) {
      this.insertAdjacentHTML('beforeend', `
        <ul class="od-search-results"></ul>
      `);
    }

    // now that we have a DOM we can query it and save references to those nodes
    this.formEl = query('form', this)[0];
    this.inputEl = query('input', this)[0];
    this.resultsContainerEl = query('.od-search-results', this)[0];
  }

  /*
    initialize the resultItemTemplate and noResultsTemplate
  */
  initResultsTemplates () {
    if (this.resultItemTemplate && this.noResultsTemplate) {
      return;
    }

    // compile the results item template
    if (this.querySelector('#od_result_item_template')) {
      // it was provided in the element
      this.resultItemTemplate = tmpl('od_result_item_template');
    } else {
      // use the default
      this.resultItemTemplate = tmpl(`
        <li class="od-search-results-item">
            <a href="<%=dataset_url%>" target="_blank">
              <%=name%>
            </a>
        </li>
      `);
    }

    // compile the no results template
    if (this.querySelector('#od_no_results_template')) {
      // it was provided in the element
      this.noResultsTemplate = tmpl('od_no_results_template');
    } else {
      // use the default
      this.noResultsTemplate = tmpl(`
        No results found for '<%=q%>'
      `);
    }
  }

  // called whenever an element is added to the DOM
  // events should be attached here
  attachedCallback () {
    this.formEl.addEventListener('submit', this.handleSubmit.bind(this));
  }

  // called when the element is removed from the DOM
  // events should be removed here
  detachedCallback () {
    this.formEl.removeEventListener('onSubmit', this.handleSubmit);
  }

  /*
    Raises an event from this element - wraps dispatchEvent
  */
  raiseEvent (name, data, bubbles = true) {
    this.dispatchEvent(new CustomEvent(name, {
      bubbles: bubbles,
      detail: data
    }));
  }

  /*
    handles form submission
  */
  handleSubmit (evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.q = this.inputEl.value;
    let url = this.searchUrl(this.inputEl.value);
    this.search(url);
  }

  /*
    performs the search
  */
  search (url) {
    this.raiseEvent('beforesearch', { url: url });
    this.resultsContainerEl.innerHTML = '';
    this._xhr(url);
  }

  /*
    performs the actual xhr for search results - wraps imported xhr function
  */
  _xhr (url) {
    xhr(url, this.handleResults.bind(this), this.handleError.bind(this));
  }

  /*
    handles search response
  */
  handleResults (response) {
    this.raiseEvent('aftersearch', { results: response });
    this.raiseEvent('beforeresults', { results: response });

    // augment search results with dataset_url
    response.data = response.data.map(function (item) {
      item.dataset_url = this.itemUrl(item.id);
      return item;
    }.bind(this));
    // show the results
    this.insertResults(response.data);

    this.raiseEvent('afterresults', { results: response });
  }

  /*
    inserts search result items or no results message into the element
  */
  insertResults (data) {
    this.initResultsTemplates();

    if (data && data.length) {
      // TODO: there are probably more performant ways of doing this...
      var els = data.map(this.resultItemTemplate);
      this.resultsContainerEl.insertAdjacentHTML('beforeend', els.join(''));
    } else {
      this.resultsContainerEl.insertAdjacentHTML('beforeend', this.noResultsTemplate(this));
    }
  }

  /*
    handles xhr error
  */
  handleError (xhr) {
    console.error('opendata-search failed to fetch data from ', this.searchUrl());
    this.raiseEvent('error', { url: this.searchUrl() });
  }

  /*
    constructs search url from element attributes
  */
  searchUrl (q) {
    return `${this.api}datasets.json?q=${this.q}&per_page=${this.limit}&sort_by=${this.sort}&group_id=${this.group}&fields=${this.fields}`;
  }

  /*
    constructs a dataset url from element attributes and passed id
  */
  itemUrl (itemId) {
    return `${this.api}datasets/${itemId}`;
  }

  // dom attributes also map to properties on the object
  // so we need to define a getter/setter pair for each of our
  // attributes, this is neccessary for frameworks like Aurelia
  // which expect custom elements to exactly mimic DOM elements
  // it also will make the programatic API easier

  get api () {
    let api = this.getAttribute('api') || '';
    // make sure there's a trailing slash
    api = api.replace(/\/$/, '') + '/';
    return api;
  }

  set api (itemid) {
    this.setAttribute('api', itemid);
  }

  get limit () {
    return parseFloat(this.getAttribute('limit'));
  }

  set limit (limit) {
    this.setAttribute('limit', limit);
  }

  get sort () {
    return this.getAttribute('sort');
  }

  set sort (sort) {
    this.setAttribute('sort', sort);
  }

  get group () {
    return this.getAttribute('group');
  }

  set group (group) {
    this.setAttribute('group', group);
  }

  get q () {
    return this.getAttribute('q');
  }

  set q (q) {
    this.setAttribute('q', q);
  }

  get requiredFields () {
    // the fields on which the default configuration depends
    return [ 'name', 'id' ];
  }

  get fields () {
    return this.getAttribute('fields');
  }

  set fields (fields) {
    // the component itself needs name, id
    let fieldsAry = fields.length === 0 ? [] : fields.split(',');
    this.requiredFields.forEach(function (item) {
        if (fieldsAry.indexOf(item) === -1) { fieldsAry.unshift(item); }
    });

    this.setAttribute('fields', fieldsAry.join(','));
  }

}

// now we register our element with the DOM this returns a constructor function
// that we can use to build a nice programatic API
var OpendataSearchElement = document.registerElement('opendata-search', OpendataSearch);

// now we export a programatic API from this module that
// will merge a set of initial attributes into our element
export default function (attributes) {
  return Object.assign(new OpendataSearchElement(), attributes);
}
