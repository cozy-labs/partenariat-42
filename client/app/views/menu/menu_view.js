var BaseView = require('../../lib/base_view');
var CountListView = require('./count_list_view');
var template = require('./templates/menu');
var app = require('../../application');

var MenuView = BaseView.extend({
	el: '#sidebar',

	template: template,

	events: {
		'click #menu-all-count'		: 'goHomeView',
		'click #menu-add-count'		: 'createNewCount',
		'click #menu-archives'		: 'goToArchives',
	},

	afterRender: function () {
		this.countCollectionView = new CountListView(window.countCollection);
		this.countCollectionView.render();
	},


	goHomeView: function () {
		app.router.navigate('', {trigger: true});
	},


	createNewCount: function () {
		app.router.navigate('count/create', {trigger: true});
	},


	goToArchives: function () {
		app.router.navigate('archive', {trigger: true});
	},

});

module.exports = MenuView;
