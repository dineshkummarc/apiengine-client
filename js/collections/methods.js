define([
  'jquery',
  'underscore',
  'backbone'
], function($, _, Backbone){
  var Methods = Backbone.Collection.extend({
    url: function () {
    	return '/apis/' + this.apiId + '/methods'
    }
  });

  return Methods;
});
