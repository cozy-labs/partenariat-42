var ViewCollection = require('../../lib/view_collection');

var CountListView = ViewCollection.extend({
	el: '#home-list-count',

	initialize: function (attributes) {
		this.collection = attributes.collection;
		this.itemView = attributes.itemView;
		ViewCollection.prototype.initialize.call(this);
	},
});

module.exports = CountListView;
