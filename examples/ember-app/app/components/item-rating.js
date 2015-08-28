import Ember from 'ember';
import ItemRating from './item-rating-core';

export default Ember.Component.extend({
  tagName: 'item-rating',
  attributeBindings: ['numratings', 'rating', 'itemid'],

  // translate the `rateitem` action from our custom element into an
  // action our controller can understand. If this has a parent component
  // you can opt to just impliment a `rateitem` function on the component
  // to listen to the event
  rateitem: function (e) {
    this.sendAction(`rateItem`, e.originalEvent);
  }
});
