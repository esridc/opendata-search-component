'use strict';

/*
  NOTE: for reasons unknown, these tests fail in phantomjs
  document.registerElement is called but
  the element seems to be registered without the class definition
  so createdCallback and attachedCallback never run
  thus, these tests need to be run with `npm run integration`
*/

import OpendataSearch from '../src/opendata-search.js';

describe('OpendataSearch', () => {

  describe('document.createElement', () => {

    var inst;

    // inject the HTML fixture for the tests
    beforeEach(function() {
      var fixture = `
        <div id="fixture">
          <opendata-search id="my-od-search"></opendata-search>
        </div>
      `;
      document.body.insertAdjacentHTML('afterbegin', fixture);
      inst = document.querySelector('#my-od-search');
      inst._xhr = function () {
        inst.handleResults({
          data: [
            {
              id: 'abc123',
              name: 'foo'
            },
            {
              id: 'xyz789',
              name: 'bar'
            }
          ]
        });
      };
    });

    // remove the html fixture from the DOM
    afterEach(function() {
      document.body.removeChild(document.getElementById('fixture'));
    });

    it('should be defined', function () {
      expect(inst).toBeDefined();
      //console.log(JSON.stringify(inst));
    });

    it('should have default attributes', function () {
      expect(inst.id).toEqual('my-od-search');
      expect(inst.tagName.toLowerCase()).toEqual('opendata-search');
      // expect(inst.getAttribute('api')).toEqual('http://opendata.arcgis.com/');
      expect(inst.api).toEqual('http://opendata.arcgis.com/');
      expect(inst.limit).toEqual(10);
      expect(inst.sort).toEqual('');
      expect(inst.group).toEqual('');
      expect(inst.q).toEqual('');
    });

    it('should have required fields', function () {
      var requiredFields = inst.requiredFields.reverse().join(',');
      expect(inst.fields).toEqual(requiredFields);
      expect(inst.getAttribute('fields')).toEqual(requiredFields);
    });

    it('should generate the appropriate searchUrl', function () {
      expect(inst.searchUrl()).toEqual('http://opendata.arcgis.com/datasets.json?q=&per_page=10&sort_by=&group_id=&fields=id,name');
    });

    it('should generate the appropriate itemUrl', function () {
      expect(inst.itemUrl('abc123')).toEqual('http://opendata.arcgis.com/datasets/abc123');
    });

    it('should render appropriate html', function () {
      expect(inst.innerHTML).toContain(`
        <form>
          <label>Search for:</label>
          <input type="search">
          <button type="submit">Search</button>
        </form>
      `);

      expect(inst.innerHTML).toContain('<ul class="od-search-results"></ul>');
    });

    it('cannot set requiredFields', function () {
      var func = function() {
        inst.requiredFields = [ 'foo', 'bar' ];
      };

      expect(func).toThrowError(TypeError);
    });

    it('searches', function () {
      inst.inputEl.value = 'water';
      inst.querySelector('form button').click();

      //some functions should have been called
      //some events should have been raised
      //do this async?

      expect(inst.querySelectorAll('.od-search-results-item').length).toEqual(2)
    });

  });

});
