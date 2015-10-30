var BaseView = require('../../../lib/base_view');
var app = require('../../../application');

var colorSet = require('../../../helper/color_set');

/*
 * View wiche manage the editing for an update or a creation of a view
 * I make the both in the same class because it's exactly the same data to
 * manage.
 *
 * It's an update when this.count is defined, so we update this count else if we
 * find no count it's a creation.
 */
var CountEditorView = BaseView.extend({
	id: 'count-editor-screen',
	template: require('./templates/count_editor'),

	events: {
		'click #submit-editor':	'submitEditor',
		'click #add-user'			: 'addUser',
		'click .currency'			: 'setCurrency',
	},


	initialize: function (params) {

    this.userList = [];
    this.currencies = [];
    this.countName = '';
    this.nameIsUsed = false;

		this.count = params.countId;
		BaseView.prototype.initialize.call(this);
	},


  /*
   * Add a listener in the changes of the input of name
   */
	afterRender: function () {
		this.$('#input-name')[0].addEventListener('change', (function(_this) {
			return function (event) {_this.checkCountName(event);};
		})(this));
	},


  /*
   * Check if the count name is valable. It can't match with any of the other
   * count because that would create somes conflics in the url managements (we
   * find the counts by the name). For now we check the archive.
   * TODO: move the archive finding and url management to id
   */
  checkCountName: function (event) {
		var countName = event.target.value;

    // Check the count collection
		var nameIsTaken = window.countCollection.find(function (elem) {
			if (elem.get('name')== countName) {
				return true;
			}
			return false;
		});

    // Check the archive collection
    if (nameIsTaken === undefined || nameIsTaken === null) {
      var nameIsTaken = window.archiveCollection.find(function (elem) {
        if (elem.get('name')== countName) {
          return true;
        }
        return false;
      });
    }

		var inputGrp = this.$('#input-name-grp');
    // If name is tacken I add an alert
		if (nameIsTaken !== null && nameIsTaken !== undefined) {
			if (this.nameIsUsed === false) {
				inputGrp.addClass('has-error');
				inputGrp.append('<div id="name-used" class="alert alert-danger" role="alert">Name already use</div>');
				this.nameIsUsed = true;
			}
		} else {
      // Else we set the count name
				if (this.nameIsUsed === true) {
					this.$('#name-used').remove();
					inputGrp.removeClass('has-error');
					this.nameIsUsed = false;
				}
				this.countName = countName;
		}
	},


  /*
   * TODO: explain that...
   */
	getRenderData: function () {
		if (this.count != null && this.count != undefined) {
			var model = window.countCollection.get(this.count);
			return ({model: model.toJSON()});
		}
		return ({model: null});
	},


  /*
   * Manage if there is an update or a creation and send to the good methode
   */
	submitEditor: function () {
		if (this.count == null || this.count == undefined) {
			this.lauchCountCreation();
			return;
		}

		this.lauchCountUpdate();
	},


  /*
   * Check if the name is already taken is the count. If it taken it put an
   * alert else he add a button with the name.
   */
	addUser: function (event) {
		var color = colorSet[this.userList.length % colorSet.length];
		var newUser = this.$('#input-users').val();

		this.$('#alert-name').remove();

    // Check if the name is already in the userList
		var nameIsTaken = this.userList.find(function (user) {
			if (user.name === newUser) {
				return true;
			}
			return false;
		});

    // If there is a name we put the alert
		if (nameIsTaken !== undefined) {
			this.$('#input-user-grp').append('<div id="alert-name" class="alert alert-danger" role="alert"><a href="#" class="close" data-dismiss="alert">&times;</a>Name already taken</div>');
			return;
		}

    // Else we create a user
		if (newUser.length > 0) {
			this.userList.push({
				name: newUser,
				seed: 0,
				leech: 0,
				color: color
			});

      // Add the button
			this.$('#list-users').append('<button class="btn" style="background-color: #'+ color +'">' + newUser + '</button>');
      // Add empty the input
      this.$('#input-users').val('');
		}
	},


  /*
   * Set the currencies available of the count
   * TODO: Move to check input like the users in the add expense to avoid the
   * manual managing of the overlighting
   */
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
			this.currencies.splice(currencyIndex, 1);
		}
	},


  /*
   * Check all inputs to verifies if their are correct. If their wrong an alert
   * div is trigger. If all inputs are good I save the new count in the
   * collection server side
   */
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
				status: 'active',
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


    /*
     * Trigger an alert
     */
	errorMessage: function (msg) {
		this.$('#alert-zone').append('<div class="alert alert-danger" role="alert"><a href="#" class="close" data-dismiss="alert">&times;</a>'+msg+'</div>');
	},



    /*
     * Lauche an update server side
     * TODO: improve it and ckeck if name is already taken
     */
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
			success: function (data) {
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

module.exports = CountEditorView;
