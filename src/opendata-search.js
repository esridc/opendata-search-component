/* global HTMLElement CustomEvent */

/*
  TODO:
    raiseEvent method
    it can't find the second script tag - i think we will need to define them outside and provide their ids
    unit tests & integration tests - test declarative usage...
    documentation
    make it npm installable
    other url parameters: fields="title,tags,created_at,download_links"
    other features for down the road:
      pagination (this could possibly be done from outside using events)
      loading indicator (this could possibly be done from outside using events)
      autocomplete
      location...
*/

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
    this.q = this.q || '';
    this.limit = this.limit || 10;
    this.sort = this.sort || ''; //use api default
    this.group = this.group || '';

    this.injectCSS();
    this.injectHTML();
  }

  injectCSS () {
    // insert base styles
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
        opendata-search .od-search-results-item h1 {
          margin: 0;
          font-size: 1.5em;
        }
      <style>
    `);
  }

  injectHTML () {
    // insert the HTML structure of this element if it was not provided
    if (query('form input', this).length === 0) {
      this.insertAdjacentHTML('beforeend', `
        <form>
          <label>Search for:</label>
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

  initResultsTemplates () {
    // compile the results item template
    if (this.querySelector('#od_result_item_template')) {
      this.resultItemTemplate = tmpl('od_result_item_template');
    } else {
      this.resultItemTemplate = tmpl(`
        <li class="od-search-results-item">
          <h1>
            <a href="<%=dataset_url%>" target="_blank">
              <%=name%>
            </a>
          </h1>
        </li>
      `);
    }

    // compile the no results template
    if (this.querySelector('#od_no_results_template')) {
      this.noResultsTemplate = tmpl('od_no_results_template');
    } else {
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

  raiseEvent (name, data, bubbles = true) {
    this.dispatchEvent(new CustomEvent(name, {
      bubbles: bubbles,
      detail: data
    }));
  }

  handleSubmit (evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.q = this.inputEl.value;
    let url = this.searchUrl(this.inputEl.value);
    this.search(url);
  }

  search (url) {
    this.raiseEvent('before:search', { url: url });

    this.resultsContainerEl.innerHTML = '';

    this.xhr(url);
  }

  xhr (url) {
    xhr(url, this.handleResults.bind(this), this.handleError.bind(this));
  }

  handleResults (response) {
    this.raiseEvent('after:search', { results: response });
    this.raiseEvent('before:results', { results: response });

    response.data = response.data.map(function (item) {
      item.dataset_url = this.itemUrl(item.id);
      return item;
    }.bind(this));
    this.insertResults(response.data);

    this.raiseEvent('after:results', { results: response });
  }

  insertResults (data) {
    if (!this.resultItemTemplate || !this.noResultsTemplate) {
      this.initResultsTemplates();
    }

    if (data && data.length) {
      // TODO: there are probably more performant ways of doing this...
      var els = data.map(this.resultItemTemplate);
      this.resultsContainerEl.insertAdjacentHTML('beforeend', els.join(''));
    } else {
      this.resultsContainerEl.insertAdjacentHTML('beforeend', this.noResultsTemplate(this));
    }
  }

  handleError (xhr) {
    console.error('opendata-search failed to fetch data from ', this.searchUrl());
    this.raiseEvent('error', { url: this.searchUrl() });
  }

  searchUrl (q) {
    return `${this.api}datasets.json?q=${this.q}&per_page=${this.limit}&sort_by=${this.sort}&group_id=${this.group}`;
  }

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

}

// now we register our element with the DOM this returns a constructor function
// that we can use to build a nice programatic API
var OpendataSearchElement = document.registerElement('opendata-search', OpendataSearch);

// now we export a programatic API from this module that
// will merge a set of initial attributes into our element
export default function (attributes) {
  return Object.assign(new OpendataSearchElement(), attributes);
}
