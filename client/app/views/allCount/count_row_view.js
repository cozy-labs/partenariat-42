var BaseView = require('../../lib/base_view');

var app = require('../../application');

var CountRowView = BaseView.extend({
	template: require('./templates/count_row'),

	events: {
		'click .count-delete-count' : 'deleteCount',
		'click .count-modify-count' : 'modifyCount',
	},

	getRenderData: function () {
		return ({model: this.model.toJSON()});
	},

	deleteCount: function () {
		window.countCollection.remove(this);
		this.model.destroy();
	},


	modifyCount: function () {
		app.router.navigate('count/update/' + this.model.id, {trigger: true});
	},

});

module.exports = CountRowView;
