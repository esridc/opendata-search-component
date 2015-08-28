import Ember from 'ember';

export default Ember.Route.extend({
  // provide some dummy inital state to our controller
  setupController (controller, model) {
    controller.set('rating', 4.25);
    controller.set('numRatings', 6);
    controller.set('itemId', '30e5fe3149c34df1ba922e6f5bbf808f');
  }
});
