
var AllCountView = require('views/allCount/all_count_view');
var AllArchiveView = require('views/allArchives/all_archive_view');

var CountView = require('views/count/count_view');
var MenuView = require('views/menu/menu_view');
var CountEditorView = require('views/count-editor/count_editor_view');
var ArchiveView = require('views/archive/archive_view');

var CountList = require('collections/count_list');
var Count = require('models/count');

var Router = Backbone.Router.extend({

	mainScreen: null,
	mainMenu: null,
	currentButton: null,

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
		'archive'							: 'printAllArchive',
		'archive/:name'				: 'printArchive',
	},


	mainBoard: function () {
		if (window.countCollection.length === 0) {
			this.navigate('count/create', {trigger: true});
		} else {
			this.selectInMenu($('#menu-all-count').parent());
			view = new AllCountView();

			this.displayView(view);
		}
	},


	countEditor: function (countId) {
		this.selectInMenu($('#menu-add-count').parent());
		view = new CountEditorView({countId: countId});

		this.displayView(view);
	},


	printCount: function (countName) {
		this.selectInMenu($('#count-'+countName).parent());
		view = new CountView({
			countName: countName,
			modifyPermission: true,
		});

		this.displayView(view);
	},


	printAllArchive: function () {
		this.selectInMenu($('#menu-archives').parent());
		view = new AllArchiveView();

		this.displayView(view);
	},


	printArchive: function (archiveName) {
		view = new ArchiveView({
			countName: archiveName,
			modifyPermission: false,
		});

		this.displayView(view);
	},


	selectInMenu: function (button) {
		if (this.currentButton !== null) {
			this.currentButton.removeClass('active');
		}
		this.currentButton = button;
		this.currentButton.addClass('active');
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
