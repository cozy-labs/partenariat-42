var BaseView = require('../../lib/base_view');
var CountListView = require('./count_list_view');
var app = require('../../application');

/*
 * Main view for the sidemenu. Contain the viewCollection count_list_view to
 * dynamically create a list of the count name  and redirect to the good url.
 */
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
