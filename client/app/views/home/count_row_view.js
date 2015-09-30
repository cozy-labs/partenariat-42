var BaseView = require('../../lib/base_view');
var template = require('./templates/count_row');

var app = require('../../application');

var HomeCountRowView = BaseView.extend({
	template: template,

	events: {
		'click .home-delete-count' : 'deleteCount',
		'click .home-modify-count' : 'modifyCount',
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

module.exports = HomeCountRowView;
