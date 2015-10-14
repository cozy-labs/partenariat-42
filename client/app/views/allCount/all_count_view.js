var BaseView = require('../../lib/base_view');
var CountListView = require('./count_list_view');


var app = require('../../application');

var AllCount = BaseView.extend({
	id: 'all-count-screen',
  template: require('./templates/all_count'),

	events: {
		'click #create-new-count' : 'createNewCount',
	},

	initialize: function (attributes) {
		this.collection = attributes.collection;
		this.itemView = attributes.itemView;
		BaseView.prototype.initialize.call(this);
	},


	afterRender: function () {
		this.countCollectionView = new CountListView({
			collection: this.collection,
			itemView: this.itemView
		});
		this.countCollectionView.render();
	},


	createNewCount: function () {
		app.router.navigate('count/create', {trigger: true});
	},

});

module.exports = AllCount;
