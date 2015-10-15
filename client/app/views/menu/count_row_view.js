var BaseView = require('../../lib/base_view');
var app = require('../../application');

var MenuCountRowView = BaseView.extend({
	template: require('./templates/count_row'),

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
		app.router.selectInMenu(this.$el);
		app.router.navigate('count/' + this.model.get('name'), {trigger: true});
	},
});

module.exports = MenuCountRowView;
