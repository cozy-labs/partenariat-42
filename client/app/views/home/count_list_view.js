
var ViewCollection = require('../../lib/view_collection');
var HomeCountRowView = require('./count_row_view');

var HomeCountListView = ViewCollection.extend({
	el: '#home-list-count',

	itemView: HomeCountRowView,


	initialize: function (collection) {
		this.collection = collection;
		ViewCollection.prototype.initialize.call(this);
	},
});

module.exports = HomeCountListView;
