
var AllCount = require('views/allCount/all_count_view');
var MenuView = require('views/menu/menu_view');
var CountEditorView = require('views/count-editor/count_editor_view');
var CountView = require('views/count/count_view');

var CountRowView = require('views/allCount/count_row_view');
var ArchiveRowView = require('views/allCount/archive_row_view');



var CountList = require('collections/count_list');
var Count = require('models/count');

var Router = Backbone.Router.extend({

	mainScreen: null,
	mainMenu: null,

	initialize: function () {
		if (window.countCollection == null || window.countCollection == undefined) {
			this.initializeCollections();
		}

		this.mainMenu = new MenuView();
		this.mainMenu.render();

		Backbone.Router.prototype.initialize.call(this);
	},

	routes: {
		''										: 'mainBoard',
		'count/create'				: 'countEditor',
		'count/update/:id'		: 'countEditor',
		'count/:name'					: 'printCount',
		'archive'							: 'printArchive',
	},


	mainBoard: function () {
		view = new AllCount({
			collection: window.countCollection,
			itemView: CountRowView,
		});

		this.displayView(view);
	},


	countEditor: function (countId) {
		view = new CountEditorView({countId: countId});

		this.displayView(view);
	},


	printCount: function (countName) {
		view = new CountView({countName: countName});

		this.displayView(view);
	},


	printArchive: function () {
		view = new AllCount({
			collection: window.archiveCollection,
			itemView: ArchiveRowView,
		});

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


	initializeCollections: function () {
		window.countCollection = new CountList();
		window.archiveCollection = new CountList();

		if (window.listCount == null || window.listCount == undefined || window.listCount == "") {
			console.log('listCount empty');
			return;
		}

		for (index in window.listCount) {
			var count = window.listCount[index];
			if (count.status === 'active') {
				var newCount = new Count(count);
				window.countCollection.add(newCount);
			}
			else if (count.status === 'archive') {
				var newCount = new Count(count);
				window.archiveCollection.add(newCount);
			}
		}
	},
});

module.exports = Router;
