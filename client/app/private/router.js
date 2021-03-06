/*jslint plusplus: true*/

// View list
var AllCountView = require('./views/allCount/all_count_view');
var AllArchiveView = require('./views/allArchives/all_archive_view');

// View screen
var CountView = require('./views/count/count_view');
var MenuView = require('./views/menu/menu_view');
var CountUpdateView = require('./views/countEditor/count_update_view');
var CountCreationView = require('./views/countEditor/count_creation_view');
var ArchiveView = require('./views/count/archive_view');
var NewExpense = require('./views/newEvent/expense/new_expense_view');
var SocketListener = require('./lib/socket');

// Models
var CountList = require('./collections/count_list');
var Count = require('./models/count');

var Router = Backbone.Router.extend({

  mainMenu: null,
  mainView: null,
  currentButton: null,

  /*
   * Initialize the main collections and the real-time socket. The menu is the
   * same in each view so it rendered here.
   *
   */
  initialize: function () {
    this.initializeCollections();


    this.socket = new SocketListener();
    this.socket.watch(window.countCollection);


    this.mainMenu = new MenuView();
    this.mainMenu.renderCounts();

    Backbone.Router.prototype.initialize.call(this);
  },


  routes: {
    ''                          : 'mainBoard',
    'count/create'              : 'countCreation',
    'count/update/:id'          : 'countUpdate',
    'count/:id'                 : 'printCount',
    'count/:name/new-expense'   : 'newExpense',
    'count/:name/new-repayment' : 'newRepayment',
    'archive'                   : 'printAllArchive',
    'archive/:name'             : 'printArchive',
  },


  /*
   * Print The main Board with the list of counts.
   *
   * If there is not count it redirect to the count creation
   */
  mainBoard: function () {
    if (window.countCollection.length === 0) {
      this.navigate('count/create', {trigger: true});
    } else {
      this.selectInMenu($('#menu-all-count').parent());
      var view = new AllCountView();

      this.displayView(view);
    }
  },


  /*
   * This view is used for count modification
   */
  countUpdate: function (countId) {
    var count = window.countCollection.get(countId),
      view = null;

    this.selectInMenu($('#count-' + count.get('name')).parent());
    view = new CountUpdateView({count: count});

    this.displayView(view);
  },


  /*
   * This view is used for count creation
   */
  countCreation: function () {
    this.selectInMenu($('#menu-add-count').parent());
    var view = new CountCreationView();

    this.displayView(view);
  },


  /*
   * Screen for create a new expense
   */
  newExpense: function (countName) {
    this.selectInMenu($('#count-' + countName).parent());

    var view = new NewExpense({countName: countName, type: 'expense'});

    this.displayView(view);
  },


  /*
   * Screen for create a new expense
   */
  newRepayment: function (countName) {
    this.selectInMenu($('#count-' + countName).parent());

    var view = new NewExpense({countName: countName, type: 'payment'});

    this.displayView(view);
  },


  /*
   * Print specific count
   */
  printCount: function (countName) {
    this.selectInMenu($('#count-' + countName).parent());

    var view = new CountView({countName: countName});

    this.displayView(view);
  },


  /*
   * Print all archives
   */
  printAllArchive: function () {
    this.selectInMenu($('#menu-archives').parent());
    var view = new AllArchiveView();

    this.displayView(view);
  },


  /*
   * Print specifique archive
   */
  printArchive: function (archiveName) {
    this.selectInMenu($('#menu-archives').parent());
    var view = new ArchiveView({countName: archiveName});

    this.displayView(view);
  },


  /*
   * Manage menu overlight, must be call in all path
   */
  selectInMenu: function (button) {
    if (this.currentButton !== null) {
      this.currentButton.removeClass('active');
    }
    this.currentButton = button;
    this.currentButton.addClass('active');
  },


  /*
   * Generic function to manage view printing, must be call if you want print
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


  /*
   * Set the fetched data from server in the two main collection:
   *
   * - countCollection
   * - archiveCollection
   *
   * All data are send directly with the first page so we don't have to manage
   * an "in-time" fetching. Currently there isn't a bunch of data so it is the
   * simpliest way and it haven't consequences on rendering time
   */
  initializeCollections: function () {
    var index = null,
      count = null,
      newCount = null;

    window.countCollection = new CountList();
    window.archiveCollection = new CountList();

    if (window.listCount === null) {
      console.log('listCount empty');
      return;
    }

    for (index = 0; index < window.listCount.length; index++) {
      count = window.listCount[index];
      if (count.status === 'active') {
        newCount = new Count(count);
        window.countCollection.add(newCount);
      } else if (count.status === 'archive') {
        newCount = new Count(count);
        window.archiveCollection.add(newCount);
      }
    }
  },
});

module.exports = Router;
