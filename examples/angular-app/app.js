var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var angular2_1 = require('angular2/angular2');
// Annotation section
var MyAppComponent = (function () {
    function MyAppComponent() {
        this.itemId = '30e5fe3149c34df1ba922e6f5bbf808f';
        this.rating = 4.25;
        this.numRatings = 6;
    }
    MyAppComponent.prototype.rateItem = function ($event) {
        console.log($event);
        console.log('Rating In Angular:', $event.detail.rating);
    };
    MyAppComponent = __decorate([
        angular2_1.Component({
            selector: 'my-app'
        }),
        angular2_1.View({
            template: "\n    <item-rating\n      item-id=\"{{itemId}}\"\n      rating=\"{{rating}}\"\n      num-ratings=\"{{numRatings}}\"\n      (rateitem)=\"rateItem($event)\">"
        }), 
        __metadata('design:paramtypes', [])
    ], MyAppComponent);
    return MyAppComponent;
})();
angular2_1.bootstrap(MyAppComponent);
