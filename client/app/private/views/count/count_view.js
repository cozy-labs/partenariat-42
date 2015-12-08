var CountBaseView = require('./count_base_view');
var app = require('../../application');

var colorSet = require('../../helper/color_set');



/*
 * The base view for the ACTIVE count, based on the countBaseView class
 */
var CountView = CountBaseView.extend({
  id: 'count-screen',

  count: null,
  dataResume: {
    allExpense: 0,
  },

  newExpense: null,
  balancing: null,

  events: {
    'click #count-lauch-add-user' : 'addUser',
    'click #add-new-expense'      : 'lauchNewExpense',
    'click #add-new-repayment'    : 'lauchNewRepayment',
    'click .header-expense-elem'  : 'printTransferBody',
    'click .delete-expense-elem'  : 'deleteExpense',
    'click #header-balancing'     : 'printBalancing',
  },


  /*
   * Find the count model from his name
   */
  initialize: function (attributes) {
    this.count = window.countCollection.models.find(function (count) {
      return count.get('name') === attributes.countName;
    });

    CountBaseView.prototype.initialize.call(this);
  },


  /*
   * All the process to add an user in the count
   */
  addUser: function () {
    var userList = this.count.get('users'),
      newUser = this.$('#count-input-add-user').val(),
      color = colorSet[userList.length % colorSet.length],
      nameIsTaken = null;

    if (newUser.length === 0) {
      return;
    }
    // Remove precedent alert
    this.$('#alert-name').remove();
    // Check if the name is taker
    nameIsTaken = userList.find(function (elem) {
      return elem.name === newUser;
    });

    // Print an alert and quit if the name is taken
    if (nameIsTaken !== undefined) {
      this.$('#name-alert').append("<div id='alert-name' class='alert" +
          "alert-danger' role='alert'><a href='#' class='close'" +
          " data-dismiss='alert'>&times;</a>Name already taken</div>");
      return;
    }

    // Add the name to the userlist if not taken
    userList.push({name: newUser, seed: 0, leech: 0, color: color});

    // Add the user button to  userlist
    this.$('#user-list').append('<div class="row"><button class="btn"' +
        'style="background-color: #' + color + '">' + newUser +
        '</button></div>');

    // Save the new list of user
    this.count.save({users: userList});

    // Empty the user input
    this.$('#count-input-add-user').val('');

    // Update the stats
    if (this.balancing !== null && this.balancing !== undefined) {
      this.balancing.update();
    }
  },


  /*
   * The new expense editor is managed in a new page in order to make this page
   * lighter in code and informations. It's also easier because we re-render
   * the count with the new data so we haven't to handle hot change
   */
  lauchNewExpense: function (event) {
    app.router.navigate('count/' + this.count.get('name') + '/new-expense',
        {trigger: true});
  },


  lauchNewRepayment: function (event) {
    app.router.navigate('count/' + this.count.get('name') + '/new-repayment',
        {trigger: true});
  },


  /*
   * Remove an expense
   */
  removeNewExpense: function () {
    this.newExpense.remove();
    delete this.newExpense;
    this.newExpense = null;

    // Remove the div
    this.$('#module').prepend('<button id="add-new-expense" class="btn' +
        'btn-default btn-block"> Add a new expense</button>');
  },


  /*
   * Expand or remove the body of an element of the history
   */
  printTransferBody: function (event) {
    var elem =  $(event.target),
      expenseBody = null;
    if (elem.is('span')) {
      expenseBody =  $(event.target).parent().next('div');
    } else {
      expenseBody =  $(event.target).next('div');
    }

    if (expenseBody.is('.printed')) {
      expenseBody.slideUp('slow');
      expenseBody.removeClass('printed');
    } else {
      expenseBody.slideDown('slow');
      expenseBody.addClass('printed');
    }
  },


  /*
   * Remove an history element and update the stats
   */
  deleteExpense: function (event) {
    var id = Number(this.$(event.target).parent().attr('id'));

    this.count.removeExpense(id);
  },

});

module.exports = CountView;
