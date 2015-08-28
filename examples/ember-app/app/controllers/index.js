import Ember from 'ember';
// import ItemRating from '../components/item-rating0';

export default Ember.Controller.extend({
  itemid: 'foo',
  rating: 4.25,
  numratings: 6,
  actions: {
    doSomethingWithRating (e) {;
      console.log('Rate In Ember:', e.detail.rating);
    }
  }
});
