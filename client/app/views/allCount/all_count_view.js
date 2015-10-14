var BaseView = require('../../lib/base_view');
var CountListView = require('./count_list_view');

var AllCountView = BaseView.extend({
	id: 'all-count-screen',
  template: require('./templates/all_count'),

	events: {
		'click #create-new-count' : 'createNewCount',
	},


	initialize: function (attributes) {
		this.collection = window.countCollection;
		BaseView.prototype.initialize.call(this);
	},


	afterRender: function () {
		this.collectionView = new CountListView({
			collection: this.collection,
		});
		this.collectionView.render();
	},


	createNewCount: function () {
		app.router.navigate('count/create', {trigger: true});
	},

});

module.exports = AllCountView;
