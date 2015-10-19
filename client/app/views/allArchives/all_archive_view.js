var BaseView = require('../../lib/base_view');
var ArchiveListView = require('./archive_list_view');

var AllArchiveView = BaseView.extend({
	id: 'all-archive-screen',
  template: require('./templates/all_archive'),


	initialize: function () {
		this.collection = window.archiveCollection;
		BaseView.prototype.initialize.call(this);
	},


	afterRender: function () {
		this.collectionView = new ArchiveListView({
			collection: this.collection,
		});
		this.collectionView.render();
	},
});

module.exports = AllArchiveView;
