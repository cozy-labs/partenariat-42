var BaseView = require('../../lib/base_view');
var template = require('./templates/count_row');
var app = require('../../application');

var MenuCountRowView = BaseView.extend({
	template: template,

	className: 'menu-count-row',
	tagName: 'li',

	initialize: function () {
		var self = this;
		this.$el.click(function () {
			self.printCount();
		})
	},


	getRenderData: function () {
		return ({model: this.model.toJSON()});
	},


	printCount: function () {
		app.router.navigate('count/' + this.model.id, {trigger: true});
	},
});

module.exports = MenuCountRowView;
