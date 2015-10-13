var BaseView = require('../../lib/base_view');
var template = require('./templates/count_editor');
var app = require('../../application');

var colorSet = require('../../helper/color_set');

var CountEditor = BaseView.extend({
	id: 'count-editor-screen',
	template: template,

	userList: [],
	currencies: [],
	countName: '',
	nameIsUsed: false,

	events: {
		'click #submit-editor':	'submitEditor',
		'click #add-user'			: 'addUser',
		'click .currency'			: 'setCurrency',
	},


	initialize: function (params) {
		this.count = params.countId;
		BaseView.prototype.initialize.call(this);
	},


	afterRender: function () {
		this.$('#input-name')[0].addEventListener('change', (function(_this) {
			return function (event) {_this.checkCountName(event);};
		})(this));
	},


	checkCountName(event) {
		var countName = event.target.value;

		var nameIsTaken = window.listCount.find(function (elem) {
			if (elem.name == countName) {
				return true;
			}
			return false;
		});

		var inputGrp = this.$('#input-name-grp');
		if (nameIsTaken !== null && nameIsTaken !== undefined) {
			if (this.nameIsUsed === false) {
				inputGrp.addClass('has-error');
				inputGrp.append('<div id="name-used" class="alert alert-danger" role="alert">Name already use</div>');
				this.nameIsUsed = true;
			}
		} else {
				if (this.nameIsUsed === true) {
					this.$('#name-used').remove();
					inputGrp.removeClass('has-error');
					this.nameIsUsed = false;
				}
				this.countName = countName;
		}
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

		if (newUser.length > 0) {
			this.userList.push({
				name: newUser,
				seed: 0,
				leech: 0,
				color: color
			});

			this.$('#list-users').append('<div><button class="btn" style="background-color: #'+ color +'">' + newUser + '</button></div>');
		}
	},


	setCurrency: function (event) {
		var selectedCurrency = event.target.value;
		var currencyIndex = null;

		this.currencies.find(function (elem, index) {
			if (elem.name == selectedCurrency) {
				currencyIndex = index;
				return true;
			}
			return false;
		});

		var btnTarget = this.$(event.target);

		if (currencyIndex == null) {
			btnTarget.removeClass('btn-default');
			btnTarget.addClass('btn-info');
			this.currencies.push({
				name: selectedCurrency,
				taux: 1,
			});
		} else {
			btnTarget.removeClass('btn-info');
			btnTarget.addClass('btn-default');
			this.currencies.splice(deviseIndex, 1);
		}
	},


	lauchCountCreation: function () {
		var countDescription = this.$('#input-description').val();
		var countName = this.countName;

		var error = false;

		this.$('#alert-zone').remove();
		this.$('#formular').prepend('<div id="alert-zone"></div>');

		if (this.nameIsUsed == true) {
			this.errorMessage('Your namee is already use');
			error = true;
		}
		if (this.countName.length <= 0) {
			this.errorMessage('Your count need a name');
			error = true;
		}
		if (this.userList.length <= 0) {
			this.errorMessage('Your count need almost one user');
			error = true;
		}
		if (this.currencies.length <= 0) {
			this.errorMessage('Your count need almost one currency');
			error = true;
		}

		if (error === false) {
			window.countCollection.create({
				name: this.countName,
				description: countDescription,
				users: this.userList,
				currencies: this.currencies,
			},{
				wait: true,
				success: function () {
					app.router.navigate('count/' + countName, {trigger: true});
				},
				error: function (xhr) {
					console.error(xhr);
					app.router.navigate('', {trigger: true});
				}});
		}
	},


	errorMessage: function (msg) {
		this.$('#alert-zone').append('<div class="alert alert-danger" role="alert"><a href="#" class="close" data-dismiss="alert">&times;</a>'+msg+'</div>');
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
