import ItemRating from './item-rating';

export class MyItem {
  itemId = '30e5fe3149c34df1ba922e6f5bbf808f';
  rating = 4.25;
  numRatings = 6;

  rateItem($event){
    console.log('Rate Item in Aurelia', $event.detail.rating);
  }
}
