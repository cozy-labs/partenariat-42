var BaseView = require('../../lib/base_view');
var CountListView = require('./count_list_view');


var template = require('./templates/home');
var app = require('../../application');

var HomeView = BaseView.extend({
	id: 'home-screen',
  template: template,

	events: {
		'click #create-new-count' : 'createNewCount',
	},


	afterRender: function () {
		this.countCollectionView = new CountListView(window.countCollection);
		this.countCollectionView.render();
	},


	createNewCount: function () {
		app.router.navigate('count/create', {trigger: true});
	},

});

module.exports = HomeView;
