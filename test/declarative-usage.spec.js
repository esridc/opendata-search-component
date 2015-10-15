'use strict';

import OpendataSearch from '../src/opendata-search.js';
import poller from './helpers/poller.js';

describe('OpendataSearch', () => {

  describe('declarative usage', () => {

    var inst,
        beforeSearchCb,
        afterSearchCb,
        beforeResultsCb,
        afterResultsCb;

    // inject the HTML fixture for the tests
    beforeEach(function(done) {
      var fixture = `
        <div id="fixture">
          <opendata-search id="my-od-search"></opendata-search>
        </div>
      `;
      document.body.insertAdjacentHTML('afterbegin', fixture);
      inst = document.querySelector('#my-od-search');

      beforeSearchCb = jasmine.createSpy('beforeSearchCb');
      inst.addEventListener('beforesearch', beforeSearchCb);
      afterSearchCb = jasmine.createSpy('afterSearchCb');
      inst.addEventListener('aftersearch', afterSearchCb);
      beforeResultsCb = jasmine.createSpy('beforeResultsCb');
      inst.addEventListener('beforeresults', beforeResultsCb);
      afterResultsCb = jasmine.createSpy('afterResultsCb');
      inst.addEventListener('afterresults', afterResultsCb);

      //poll the element for the _iscreated property
      poller(inst, function () {
        spyOn(inst, '_xhr').and.callFake(function () {
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
        });
        spyOn(inst, 'searchUrl').and.callThrough();
        spyOn(inst, 'search').and.callThrough();
        spyOn(inst, 'handleResults').and.callThrough();
        spyOn(inst, 'insertResults').and.callThrough();
        done();
      });
    });

    // remove the html fixture from the DOM
    afterEach(function() {
      document.body.removeChild(document.getElementById('fixture'));
    });

    it('should be defined', function () {
      expect(inst).toBeDefined();
    });

    it('should have default attributes', function () {
      expect(inst.id).toEqual('my-od-search');
      expect(inst.tagName.toLowerCase()).toEqual('opendata-search');
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

      expect(inst.searchUrl).toHaveBeenCalledWith('water');
      expect(inst.search).toHaveBeenCalledWith('http://opendata.arcgis.com/datasets.json?q=water&per_page=10&sort_by=&group_id=&fields=id,name');
      expect(inst.handleResults).toHaveBeenCalled();
      expect(inst.insertResults).toHaveBeenCalled();

      expect(beforeSearchCb).toHaveBeenCalled();
      expect(afterSearchCb).toHaveBeenCalled();
      expect(beforeResultsCb).toHaveBeenCalled();
      expect(afterResultsCb).toHaveBeenCalled();

      expect(inst.querySelectorAll('.od-search-results-item').length).toEqual(2)
    });

  });

  describe('declarative usage with attributes', () => {

    var inst,
        beforeSearchCb,
        afterSearchCb,
        beforeResultsCb,
        afterResultsCb;

    // inject the HTML fixture for the tests
    beforeEach(function(done) {
      var fixture = `
        <div id="fixture">
          <opendata-search id="my-od-search" api="http://my.open.api" limit="5" sort="relevance" group="abc123" fields="foo,bar"></opendata-search>
        </div>
      `;
      document.body.insertAdjacentHTML('afterbegin', fixture);
      inst = document.querySelector('#my-od-search');

      beforeSearchCb = jasmine.createSpy('beforeSearchCb');
      inst.addEventListener('beforesearch', beforeSearchCb);
      afterSearchCb = jasmine.createSpy('afterSearchCb');
      inst.addEventListener('aftersearch', afterSearchCb);
      beforeResultsCb = jasmine.createSpy('beforeResultsCb');
      inst.addEventListener('beforeresults', beforeResultsCb);
      afterResultsCb = jasmine.createSpy('afterResultsCb');
      inst.addEventListener('afterresults', afterResultsCb);

      //poll the element for the _iscreated property
      poller(inst, function () {
        spyOn(inst, '_xhr').and.callFake(function () {
          inst.handleResults({
            data: [
              {
                id: 'abc123',
                name: 'mira',
                foo: 'foo1',
                bar: 'bar1'
              },
              {
                id: 'xyz789',
                name: 'riley',
                foo: 'foo2',
                bar: 'bar2'
              }
            ]
          });
        });
        spyOn(inst, 'searchUrl').and.callThrough();
        spyOn(inst, 'search').and.callThrough();
        spyOn(inst, 'handleResults').and.callThrough();
        spyOn(inst, 'insertResults').and.callThrough();
        done();
      });
    });

    // remove the html fixture from the DOM
    afterEach(function() {
      document.body.removeChild(document.getElementById('fixture'));
    });

    it('should be defined', function () {
      expect(inst).toBeDefined();
    });

    it('should have default attributes', function () {
      expect(inst.id).toEqual('my-od-search');
      expect(inst.tagName.toLowerCase()).toEqual('opendata-search');
      expect(inst.api).toEqual('http://my.open.api/');
      expect(inst.limit).toEqual(5);
      expect(inst.sort).toEqual('relevance');
      expect(inst.group).toEqual('abc123');
      expect(inst.q).toEqual('');
    });

    it('should have required fields', function () {
      var requiredFields = inst.requiredFields.reverse().join(',');
      requiredFields += ',foo,bar';
      expect(inst.fields).toEqual(requiredFields);
      expect(inst.getAttribute('fields')).toEqual(requiredFields);
    });

    it('should generate the appropriate searchUrl', function () {
      expect(inst.searchUrl()).toEqual('http://my.open.api/datasets.json?q=&per_page=5&sort_by=relevance&group_id=abc123&fields=id,name,foo,bar');
    });

    it('should generate the appropriate itemUrl', function () {
      expect(inst.itemUrl('abc123')).toEqual('http://my.open.api/datasets/abc123');
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

      expect(inst.searchUrl).toHaveBeenCalledWith('water');
      expect(inst.search).toHaveBeenCalledWith('http://my.open.api/datasets.json?q=water&per_page=5&sort_by=relevance&group_id=abc123&fields=id,name,foo,bar');
      expect(inst.handleResults).toHaveBeenCalled();
      expect(inst.insertResults).toHaveBeenCalled();

      expect(beforeSearchCb).toHaveBeenCalled();
      expect(afterSearchCb).toHaveBeenCalled();
      expect(beforeResultsCb).toHaveBeenCalled();
      expect(afterResultsCb).toHaveBeenCalled();

      expect(inst.querySelectorAll('.od-search-results-item').length).toEqual(2)
    });

  });

  describe('declarative usage with html', () => {

    var inst,
        beforeSearchCb,
        afterSearchCb,
        beforeResultsCb,
        afterResultsCb;

    // inject the HTML fixture for the tests
    beforeEach(function(done) {
      var fixture = `
        <div id="fixture">
          <opendata-search id="my-od-search">
            <div>
              <div>
                <form>
                  <div>
                    <input>
                  </div>
                </form>
              </div>
            </div>
          </opendata-search>
        </div>
      `;
      document.body.insertAdjacentHTML('afterbegin', fixture);
      inst = document.querySelector('#my-od-search');

      //poll the element for the _iscreated property
      poller(inst, done);
    });

    // remove the html fixture from the DOM
    afterEach(function() {
      document.body.removeChild(document.getElementById('fixture'));
    });

    it('should render appropriate html', function () {
      expect(inst.querySelectorAll('div > div > form > div > input').length).toBe(1);
      expect(inst.innerHTML).toContain('<ul class="od-search-results"></ul>');
    });

  });

  describe('declarative usage with templates', () => {

    var inst,
        beforeSearchCb,
        afterSearchCb,
        beforeResultsCb,
        afterResultsCb;

    // inject the HTML fixture for the tests
    beforeEach(function(done) {
      var fixture = `
        <div id="fixture">
          <opendata-search id="my-od-search">
            <script id="od_result_item_template" type="text/template">
              <li>
                <h1>
                  <a href="<%=dataset_url%>" target="_blank">
                    <%=name%>
                  </a>
                </h1>
                <small>(<%=foo%>, <%=bar%>)</small>
              </li>
            </script>
          </opendata-search>
        </div>
      `;
      document.body.insertAdjacentHTML('afterbegin', fixture);
      inst = document.querySelector('#my-od-search');

      //poll the element for the _iscreated property
      poller(inst, function () {
        spyOn(inst, '_xhr').and.callFake(function () {
          inst.handleResults({
            data: [
              {
                id: 'abc123',
                name: 'mira',
                foo: 'foo1',
                bar: 'bar1'
              },
              {
                id: 'xyz789',
                name: 'riley',
                foo: 'foo2',
                bar: 'bar2'
              }
            ]
          });
        });
        spyOn(inst, 'searchUrl').and.callThrough();
        spyOn(inst, 'search').and.callThrough();
        spyOn(inst, 'handleResults').and.callThrough();
        spyOn(inst, 'insertResults').and.callThrough();
        done();
      });
    });

    // remove the html fixture from the DOM
    afterEach(function() {
      document.body.removeChild(document.getElementById('fixture'));
    });

    it('renders results properly', function () {
      inst.inputEl.value = 'water';
      inst.querySelector('form button').click();

      expect(inst.querySelectorAll('.od-search-results li').length).toEqual(2)
      expect(inst.querySelectorAll('.od-search-results li h1 a').length).toBe(2);
      expect(inst.querySelectorAll('.od-search-results li small')[0].innerText).toBe('(foo1, bar1)');
      expect(inst.querySelectorAll('.od-search-results li small')[1].innerText).toBe('(foo2, bar2)');
      expect(inst.querySelectorAll('.od-search-results li small').length).toBe(2);
    });

  });

});
