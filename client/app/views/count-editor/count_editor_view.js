var BaseView = require('../../lib/base_view');
var template = require('./templates/count_editor');
var app = require('../../application');

var colorSet = require('../../helper/color_set');

var CountEditor = BaseView.extend({
	id: 'count-editor-screen',
	template: template,

	count: null,
	userList: [],

	events: {
		'click #submit-editor':	'submitEditor',
		'click #add-user'			: 'addUser'
	},


	initialize: function (params) {
		this.count = params.countId;
		BaseView.prototype.initialize.call(this);
	},


	getRenderData: function () {
		if (this.count != null && this.count != undefined) {
			var model = window.countCollection.get(this.count);
			return ({model: model.toJSON()});
		}
		return ({model: null});
	},


	submitEditor: function () {
		if (this.count == null || this.count == undefined) {
			this.lauchCountCreation();
			return;
		}

		this.lauchCountUpdate();
	},


	addUser: function (event) {
		var color = colorSet[this.userList.length % colorSet.length];
		var newUser = this.$('#input-users').val();

		this.userList.push({
			name: newUser,
			seed: 0,
			leech: 0,
			color: color
		});

		this.$('#list-users').append('<div><button class="btn" style="background-color: #'+ color +'">' + newUser + '</button></div>');
	},


	lauchCountCreation: function () {
		console.log('this.userList: ', this.userList);
		var countName = this.$('#input-name').val();
		window.countCollection.create({
			name: countName,
			description: this.$('#input-description').val(),
			users: this.userList,
		},{
			wait: true,
			success: function () {
				app.router.navigate('count/' + countName, {trigger: true});
			},
			error: function (xhr) {
				console.error(xhr);
				app.router.navigate('', {trigger: true});
			}});
	},

	lauchCountUpdate: function () {
		var model = window.countCollection.get(this.count);
		if (model == null || model == undefined) {
			console.error('Can\'t retrieve model');
			app.router.navigate('', {trigger: true});
			return;
		}

		var change = {
			name: this.$('#input-name').val(),
			description: this.$('#input-description').val(),
		};
		model.set(change);

		model.sync('update', model, {
			error: function (xhr) {
				console.error (xhr);
			},
			success: function () {
				view = _.find(app.router.mainMenu.countCollectionView.views, function (view) {
					if (view.model.cid == model.cid) {
						return (view.model);
					}
					return (null);
				});
				view.render();
				app.router.navigate('', {trigger: true});
			}});
	},
});

module.exports = CountEditor;
