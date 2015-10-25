
var ViewCollection = require('../../lib/view_collection');
var MenuCountRowView = require('./count_row_view');

/*
 * Manage the name of the count in the menu. That's work as a ViewCollection
 * linked to a collection. If you add a model to the collection it will be
 * automatically add to the viewcollection
 */
var MenuCountListView = ViewCollection.extend({
	el: '#menu-list-count',

	itemView: MenuCountRowView,

  /*
   * Link the viewCollection to the collection
   */
	initialize: function (collection) {
		this.collection = collection;
		ViewCollection.prototype.initialize.call(this);
	},
});

module.exports = MenuCountListView;
