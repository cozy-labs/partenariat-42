var BaseView = require('../../lib/base_view');

var app = require('../../application');

var ArchiveRowView = BaseView.extend({
	template: require('./templates/archive_row'),

	events: {
		'click .archive-see-count'	: 'seeArchive',
	},

	getRenderData: function () {
		return ({model: this.model.toJSON()});
	},


	seeArchive: function () {
		app.router.navigate('archive/' + this.model.get('name'), {trigger: true});
	},
});

module.exports = ArchiveRowView;
