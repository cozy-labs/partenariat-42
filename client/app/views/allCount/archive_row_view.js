var BaseView = require('../../lib/base_view');

var app = require('../../application');

var ArchiveRowView = BaseView.extend({
	template: require('./templates/archive_row'),

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

module.exports = ArchiveRowView;
