'use strict';

import OpendataSearch from '../src/opendata-search.js';

describe('OpendataSearch', () => {

  describe('default attributes', () => {

    var inst = new OpendataSearch();

    it('should be defined', function () {
      expect(inst).toBeDefined();
    });

    it('should have default attributes', function () {
      expect(inst.api).toEqual('http://opendata.arcgis.com/');
      expect(inst.limit).toEqual(10);
      expect(inst.sort).toEqual('');
      expect(inst.group).toEqual('');
      expect(inst.q).toEqual('');
    });

    it('should have required fields', function () {
      var requiredFields = inst.requiredFields.reverse().join(',');
      expect(inst.fields).toEqual(requiredFields);
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

      expect(func).toThrowError(TypeError, 'setting a property that has only a getter');
    });

  });

  describe('assigned attributes', () => {

    var inst = new OpendataSearch({
      api: 'http://opendataqa.arcgis.com',
      limit: 5,
      sort: 'relevance',
      group: 'abc123',
      q: 'water',
      fields: 'foo,bar'
    });

    it('should be defined', function () {
      expect(inst).toBeDefined();
    });

    it('should have assigned attributes', function () {
      expect(inst.api).toEqual('http://opendataqa.arcgis.com/');
      expect(inst.limit).toEqual(5);
      expect(inst.sort).toEqual('relevance');
      expect(inst.group).toEqual('abc123');
      expect(inst.q).toEqual('water');
    });

    it('should have required fields', function () {
      var requiredFields = inst.requiredFields.reverse().join(',');
      requiredFields += ',foo,bar';
      expect(inst.fields).toEqual(requiredFields);
    });

    it('should generate the appropriate searchUrl', function () {
      expect(inst.searchUrl()).toEqual('http://opendataqa.arcgis.com/datasets.json?q=water&per_page=5&sort_by=relevance&group_id=abc123&fields=id,name,foo,bar');
    });

    it('should generate the appropriate itemUrl', function () {
      expect(inst.itemUrl('abc123')).toEqual('http://opendataqa.arcgis.com/datasets/abc123');
    });

  });

});
