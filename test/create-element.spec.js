'use strict';

import OpendataSearch from '../src/opendata-search.js';

describe('OpendataSearch', () => {

  describe('document.createElement', () => {
    var inst = document.createElement('opendata-search');
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
    document.body.appendChild(inst);

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

});
