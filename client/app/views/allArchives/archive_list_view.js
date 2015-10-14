var ViewCollection = require('../../lib/view_collection');
var ArchiveRowView = require('./archive_row_view');

var ArchiveListView = ViewCollection.extend({
	el: '#list-view',

	itemView: ArchiveRowView,

	initialize: function () {
		this.collection = window.archiveCollection;
		ViewCollection.prototype.initialize.call(this);
	}
});

module.exports = ArchiveListView;
