
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
   * I Fetch all the data from the server in during the router initialization
   * because for now there is no much data and it's easy to print any page.
   *
   * The main HTML is already render server side, be remain the count list
   */
  initialize: function () {
    this.initializeCollections();


    this.socket = new SocketListener;
    this.socket.watch(window.countCollection);


    this.mainMenu = new MenuView();
    this.mainMenu.renderCounts();

    Backbone.Router.prototype.initialize.call(this);
  },


  routes: {
    ''				         	: 'mainBoard',
    'count/create'	        	: 'countCreation',
    'count/update/:id' 	    	: 'countUpdate',
    'count/:id'                 : 'printCount',
    'count/:name/new-expense'   : 'newExpense',
    'archive'				    : 'printAllArchive',
    'archive/:name'		    	: 'printArchive',
  },


  /*
   * Print The main Board with the list of counts.
   *
   * If the is not count I redirect to the count creation
   */
  mainBoard: function () {
    if (window.countCollection.length === 0) {
      this.navigate('count/create', {trigger: true});
    } else {
      this.selectInMenu($('#menu-all-count').parent());
      view = new AllCountView();

      this.displayView(view);
    }
  },


  /*
   * This view is used for count modification
   */
  countUpdate: function (countId) {
    count = window.countCollection.get(countId);
    this.selectInMenu($('#count-'+ count.get('name')).parent());
    view = new CountUpdateView({count: count});

    this.displayView(view);
  },


  /*
   * This view is used for count creation
   */
  countCreation: function () {
    this.selectInMenu($('#menu-add-count').parent());
    view = new CountCreationView();

    this.displayView(view);
  },


  /*
   * Screen for create a new expense
   */
  newExpense: function (countName) {
    this.selectInMenu($('#count-'+countName).parent());

    view = new NewExpense({countName: countName});

    this.displayView(view);
  },


  /*
   * Count printer
   */
  printCount: function (countName) {
    this.selectInMenu($('#count-'+countName).parent());

    var view = new CountView({countName: countName});

    this.displayView(view);
  },


  /*
   * Print all archives
   */
    printAllArchive: function () {
      this.selectInMenu($('#menu-archives').parent());
      view = new AllArchiveView();

      this.displayView(view);
    },


    /*
     * Print specifique archive
     * TODO: Check if we select with archive id or name, need to be with archive
     * to avoid url conflic with count
     */
  printArchive: function (archiveName) {
    this.selectInMenu($('#menu-archives').parent());
    view = new ArchiveView({countName: archiveName});

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


  /*
   * Fetch the data from server and create two collection:
   *
   * - countCollection
   * - archiveCollection
   */
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
