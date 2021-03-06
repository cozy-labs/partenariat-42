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
    'click #count-lauch-add-user'   : 'addUser',
    'click #add-new-expense'        : 'lauchNewExpense',
    'click #add-new-repayment'      : 'lauchNewRepayment',
    'click .header-expense-elem'    : 'printTransferBody',
    'click .delete-expense-elem'    : 'deleteExpense',
    'click #header-balancing'       : 'printBalancing',
  },


  /*
   * If we are in 'cozy navigation' we get the name of the class and
   * check in the collection if he can find it. Else if we are in public
   * navigation there must be juste one count available, set in the router
   */
  initialize: function (attributes) {
    this.count = app.router.count;

    console.log('id: ', this.count.id);
    CountBaseView.prototype.initialize.call(this);
  },


  /*
   * All the process for add a user in the count
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
      this.$('#name-alert').append('<div id="alert-name" class="alert' +
          'alert-danger" role="alert"><a href="#" class="close"' +
          'data-dismiss="alert">&times;</a>Name already taken</div>');
      return;
    }

    // Add the name to the userlist if not taken
    userList.push({name: newUser, seed: 0, leech: 0, color: color});
    // Add the user button to  userlist
    this.$('#user-list').append('<div class="row"><button class="btn"' +
        'style="background-color: #' + color + '">' + newUser +
        '</button></div>');

    // Save the new list of user
    this.count.save({users: userList}, {
      url: '/public/count/' + this.count.id,
    });

    // Empty the user input
    this.$('#count-input-add-user').val('');

    // Update the is it printe
    if (this.balancing !== null && this.balancing !== undefined) {
      this.balancing.update();
    }
  },


  /*
   * The new expense editor is manage in a new page in order to make this page
   * lighter in code and informations. It's also easier we re-render the count
   * with the new data so we haven't to handle this manually.
   */
  lauchNewExpense: function (event) {
    app.router.navigate('/new-expense', {trigger: true});
  },

  lauchNewRepayment: function (event) {
    app.router.navigate('/new-repayment', {trigger: true});
  },



  /*
   * Remove an expense
   */
  removeNewExpense: function () {
    this.newExpense.remove();
    delete this.newExpense;
    this.newExpense = null;

    // Remove the div
    this.$('#module').prepend('<button id="add-new-expense" ' +
        'class="btn btn-default btn-block"> Add a new expense</button>');
  },


  /*
   * Print expand or remove data body of an element of the history
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
   * Remove a history element and update the stats
   */
  deleteExpense: function (event) {
    var id = Number(this.$(event.target).parent().attr('id'));

    this.count.removeExpense(id);
  },
});

module.exports = CountView;
