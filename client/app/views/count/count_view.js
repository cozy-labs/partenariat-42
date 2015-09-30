var BaseView = require('../../lib/base_view');
var template = require('./templates/count');
var app = require('../../application');


var CountView = BaseView.extend({
	id: 'count-screen',
	template: template,

	count: null,


	initialize: function (attributes) {
		this.count = window.countCollection.get(attributes.countId);
		BaseView.prototype.initialize.call(this);
	},

	getRenderData: function () {
		if (this.count !== null && this.count !== undefined) {
			return ({count: this.count.toJSON()});
		}
		return ({count: null});
	}

});

module.exports = CountView;
