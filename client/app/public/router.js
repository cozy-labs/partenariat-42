
// View screen
var CountView = require('./views/count/count_view');
var NewExpense = require('./views/newEvent/expense/new_expense_view');

// Models
var Count = require('./models/count');
var CountList = require('./collections/count_list');
var SocketListener = require('./lib/socket');

var Router = Backbone.Router.extend({

  mainView: null,

  /*
   * I Fetch all the data from the server in during the router initialization
   * because for now there is no much data and it's easy to print any page.
   *
   * The main HTML is already render server side, be remain the count list
   */
  initialize: function () {

    window.countCollection = new CountList();
    window.countCollection.add(new Count(window.count));

    this.count = window.countCollection.models[0];

    this.socket = new SocketListener;
    this.socket.watch(window.countCollection);

    Backbone.Router.prototype.initialize.call(this);
  },


  routes: {
    ''                  : 'printCount',
    'new-expense'       : 'newExpense',
  },


  /*
   * Screen for create a new expense
   */
  newExpense: function (countName) {
    view = new NewExpense({countName: countName});

    this.displayView(view);
  },


  /*
   * Count printer
   */
  printCount: function () {
    view = new CountView({countName: this.count.get('name')});

    this.displayView(view);
  },


  /*
   * Generique function to manage view printing, must be call if you want print
   * a screen
   */
  displayView: function (view) {
    if (this.mainView !== null && this.mainView !== undefined) {
      this.mainView.remove();
    }
    this.mainView = view;
    $('#content-screen').append(view.$el);
    view.render();
  },
});

module.exports = Router;
