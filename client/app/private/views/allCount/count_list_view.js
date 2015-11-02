
var ViewCollection = require('../../lib/view_collection');
var CountRowView = require('./count_row_view');

var CountListView = ViewCollection.extend({
	el: '#list-view',

	itemView: CountRowView,

	initialize: function () {
		this.collection = window.countCollection;
		ViewCollection.prototype.initialize.call(this);
	}
});

module.exports = CountListView;
