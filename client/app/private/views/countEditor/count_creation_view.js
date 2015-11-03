var CountEditionBase = require('./count_edition_base');
var BaseView = require('../../lib/base_view');
var app = require('../../application');

var colorSet = require('../../helper/color_set');

/*
 * View wiche manage the editing for an update or a creation of a view
 * I make the both in the same class because it's exactly the same data to
 * manage.
 *
 * It's an update when this.count is defined, so we update this count else if we
 * find no count it's a creation.
 */
var CountCreationView = CountEditionBase.extend({
  template: require('./templates/count_creation'),
  templateUrl: require('./templates/url'),

  events: {
    'click #submit-editor'  : 'lauchCountCreation',
    'click #add-user'		: 'addUser',
    'click .currency'		: 'setCurrency',
    'click #input-public'   : 'setPublic'
  },


  initialize: function (params) {

    this.userList = [];
    this.currencies = [];
    this.countName = '';
    this.nameIsUsed = false;
    this.isPublic = false;

    BaseView.prototype.initialize.call(this);
  },


  /*
   * Add a listener in the changes of the input of name
   */
  afterRender: function () {
    this.$('#input-name')[0].addEventListener('change', (function(_this) {
      return function (event) {
        _this.countName = _this.checkCountName(event);
      };
    })(this));
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
      this.$('#input-user-grp').append('<div id="alert-name" class="alert alert-danger" role="alert">\
          <a href="#" class="close" data-dismiss="alert">&times;</a>Name already taken</div>');
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
      var selectedCurrency = this.$(event.target).children().get(0).value;
      var currencyIndex = null;

      this.currencies.find(function (elem, index) {
        if (elem.name == selectedCurrency) {
          currencyIndex = index;
          return true;
        }
        return false;
      });

      if (currencyIndex == null) {
        this.currencies.push({
          name: selectedCurrency,
          taux: 1,
        });
      } else {
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
          isPublic: this.isPublic,
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
});

module.exports = CountCreationView;
