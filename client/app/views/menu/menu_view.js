var BaseView = require('../../lib/base_view');
var CountListView = require('./count_list_view');
var app = require('../../application');

var MenuView = BaseView.extend({
	el: '#sidebar',

	events: {
		'click #menu-all-count'		: 'goHomeView',
		'click #menu-add-count'		: 'createNewCount',
		'click #menu-archives'		: 'goToArchives',
	},

  /*
   * Render the list of count in the menu
   */
	renderCounts: function () {
		this.countCollectionView = new CountListView(window.countCollection);
		this.countCollectionView.render();
	},


  /*
   * Redirect to the mainBoard
   */
	goHomeView: function () {
		app.router.navigate('', {trigger: true});
	},


  /*
   * Redirect to the count creation
   */
	createNewCount: function () {
		app.router.navigate('count/create', {trigger: true});
	},


  /*
   * Redirect to the archive list
   */
	goToArchives: function () {
		app.router.navigate('archive', {trigger: true});
	},

});

module.exports = MenuView;
