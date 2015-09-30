
var HomeView = require('views/home/home_view');
var MenuView = require('views/menu/menu_view');
var CountEditorView = require('views/count-editor/count_editor_view');


var CountList = require('collections/count_list');
var Count = require('models/count');

var Router = Backbone.Router.extend({

	mainScreen: null,
	mainMenu: null,

	initialize: function () {
		if (window.countCollection == null || window.countCollection == undefined) {
			this.createCountCollection();
		}

		this.mainMenu = new MenuView();
		this.mainMenu.render();

		Backbone.Router.prototype.initialize.call(this);
	},

	routes: {
		''								: 'mainBoard',
		'count/create'		: 'countEditor',
	},


	mainBoard: function () {
		view = new HomeView();

		this.displayView(view);
	},


	countEditor: function () {
		if (window.countCollection == null || window.countCollection == undefined) {
			this.createCountCollection();
		}
		view = new CountEditorView();

		this.displayView(view);
	},


	displayView: function (view) {
		if (this.mainView !== null && this.mainView !== undefined) {
			this.mainView.remove();
		}
		this.mainView = view;
		$('#content-screen').append(view.$el);
		view.render();
	},


	createCountCollection: function () {
		window.countCollection = new CountList();

		if (window.listCount == null || window.listCount == undefined || window.listCount == "") {
			console.log('listCount empty');
			return;
		}

		var index = 0;
		while (index < window.listCount.length) {
			var newCount = new Count(window.listCount[index]);
			window.countCollection.add(newCount);
			index++;
		}
	},
});

module.exports = Router;
