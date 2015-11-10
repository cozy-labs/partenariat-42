(function() {
  'use strict';

  var globals = typeof window === 'undefined' ? global : window;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = ({}).hasOwnProperty;

  var endsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  };

  var _cmp = 'components/';
  var unalias = function(alias, loaderPath) {
    var start = 0;
    if (loaderPath) {
      if (loaderPath.indexOf(_cmp) === 0) {
        start = _cmp.length;
      }
      if (loaderPath.indexOf('/', start) > 0) {
        loaderPath = loaderPath.substring(start, loaderPath.indexOf('/', start));
      }
    }
    var result = aliases[alias + '/index.js'] || aliases[loaderPath + '/deps/' + alias + '/index.js'];
    if (result) {
      return _cmp + result.substring(0, result.length - '.js'.length);
    }
    return alias;
  };

  var _reg = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (_reg.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';
    path = unalias(name, loaderPath);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has.call(cache, dirIndex)) return cache[dirIndex].exports;
    if (has.call(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  require.register = require.define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  require.list = function() {
    var result = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  require.brunch = true;
  require._cache = cache;
  globals.require = require;
})();
require.register("private/application", function(exports, require, module) {
// Application bootstrapper.
var Application = {
  initialize: function () {

    var Router = require('./router');

    // Router initialization
    this.router = new Router();


    if (typeof Object.freeze === 'function') {
      Object.freeze(this);
    }
  }
};

module.exports = Application;

});

require.register("private/collections/count_list", function(exports, require, module) {
var Count = require('../models/count');

var CountList = Backbone.Collection.extend({
	model: Count,
	url: 'count',
});

module.exports = CountList;

});

require.register("private/helper/color_set", function(exports, require, module) {
module.exports = [
    '2979FF',
    'B3C51D',
    '00D5B8',
    'FF5700',
    'F819AA',
    '7190AB',
    '00B0FF',
    'E70505',
    'FF7900',
    '51658D',
    '304FFE',
    '00DCE9',
    'FF2828',
    '6200EA',
    '64DD17',
    '00C853',
    'FFA300',
]

});

;require.register("private/initialize", function(exports, require, module) {
var application = require('./application');

$(function () {
  application.initialize();

  Backbone.history.start();

  // Lauche listenert for responsive menu
  $('[data-toggle=offcanvas]').click(function() {
    $('.row-offcanvas').toggleClass('active');
  });
});

});

require.register("private/lib/base_view", function(exports, require, module) {

// Base class for all views.
var BaseView = Backbone.View.extend({
  initialize: function () {
    this.render = _.bind(this.render, this);
  },

  template: function () { return null; },
  getRenderData: function () { return null; },

  render: function () {
    this.$el.html(this.template(this.getRenderData()));
    this.afterRender();
    return this;
  },

  afterRender: function () { return null; }
});

module.exports = BaseView;

});

require.register("private/lib/socket", function(exports, require, module) {

var Count = require('../models/count');
var CountView = require('../views/count/count_view');
var app = require('../application');

function SocketListener() {
  // Parent constructor
  CozySocketListener.call(this);
};

CozySocketListener.prototype.models = {
  'shared-count': Count
};

CozySocketListener.prototype.events = [
  'shared-count.update'
];

SocketListener.prototype = Object.create(CozySocketListener.prototype);

SocketListener.prototype.onRemoteUpdate = function (model, collection) {
  var printModel = app.router.mainView.count;
  if (printModel.id === model.id) {
    var view = new CountView({countName: printModel.get('name')});
    app.router.displayView(view);
  }
};

module.exports = SocketListener;

});

require.register("private/lib/view_collection", function(exports, require, module) {

var BaseView = require('./base_view');

/*
   View that display a collection of subitems
   used to DRY views
   Usage : new ViewCollection(collection:collection)
   Automatically populate itself by creating a itemView for each item
   in its collection

   can use a template that will be displayed alongside the itemViews

   itemView       : the Backbone.View to be used for items
   itemViewOptions : the options that will be passed to itemViews
   collectionEl : the DOM element's selector where the itemViews will
   be displayed. Automatically falls back to el if null
   */

var ViewCollection = BaseView.extend({
  itemView: null,
  views: {},
  collectionEl: null,

  appendView: function (view) {
    this.$collectionEl.append(view.el);
  },

  initialize: function () {
    BaseView.prototype.initialize.call(this);
    this.views = {};
    this.listenTo(this.collection, 'reset', this.onReset);
    this.listenTo(this.collection, 'add', this.addItem);
    this.listenTo(this.collection, 'remove', this.removeItem);

    if (this.collectionEl === null || this.collectionEl == undefined) {
      this.collectionEl = this.el;
    }
  },

  render: function () {
    for (id in this.views) {
      this.views[id].$el.detach();
    }
    BaseView.prototype.render.call(this);
    return this;
  },

  afterRender: function () {
    this.$collectionEl = $(this.collectionEl);
    for (id in this.views) {
      this.appendView(this.views[id]);
    }
    this.onReset(this.collection);
  },

  remove: function () {
    this.onReset();
    BaseView.prototype.remove.call(this);
  },

  onReset: function (newCollection) {
    for (id in this.views) {
      view.remove();
    }
		var self = this;
		newCollection.forEach(function (elem) {
				self.addItem(elem);
		});
  },

  addItem: function (model) {
    view = new this.itemView({model: model});
    this.views[model.cid] = view.render();
    this.appendView(view);
  },


  removeItem: function (model) {
    this.views[model.cid].remove();
    delete this.views[model.cid];
  }
})

module.exports = ViewCollection;

});

require.register("private/models/count", function(exports, require, module) {

var app = require('../application');

var Count = Backbone.Model.extend({

  removeExpense: function (id) {
    var index = this.get('expenses').findIndex(function (elem) {
      if (elem.id === id) {
        return true;
      }
      return false;
    });

    var newExpenses = this.get('expenses');
    var expenseRemove = newExpenses.splice(index, 1)[0];

    var currentExpenses = this.get('allExpenses');
    var currentUsers = this.get('users');
    var leecherList = expenseRemove.leecher;
    var seeder = expenseRemove.seeder;

    var newUsersList = this.get('users').map(function (user) {
      leecherList.every(function (expenseUser) {
        if (user.name === expenseUser.name) {
          var leechPerUser = (Math.round(Number(expenseRemove.amount) / Number(expenseRemove.leecher.length) * 100) / 100).toFixed(2);
          user.leech = (Math.round((Number(user.leech) - leechPerUser) * 100) / 100).toFixed(2);
          return false;
        }
        return true;
      });

      if (user.name == seeder) {
        user.seed = (Math.round((Number(user.seed) - Number(expenseRemove.amount)) * 100) / 100).toFixed(2);
      }
      return user;
    });

    var newAllExpenses = (Math.round((Number(currentExpenses) - Number(expenseRemove.amount)) * 100) / 100).toFixed(2);

    this.save({
      expenses: newExpenses,
      allExpenses: newAllExpenses,
      users: newUsersList
    }, {
      wait: true,
      error: function (xhr) {
        console.error(xhr);
      }
    });
  },


  archive: function () {
    var self = this;
    this.save({
      status: 'archive'
    }, {
      wait: true,
      success: function () {
        window.countCollection.remove(self);
        window.archiveCollection.push(self);
        app.router.navigate('', {trigger: true});
      },
      error: function (xhr) {
        console.error(xhr);
      }
    });
  },
});

module.exports = Count;

});

require.register("private/router", function(exports, require, module) {

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

});

require.register("private/views/allArchives/all_archive_view", function(exports, require, module) {
var BaseView = require('../../lib/base_view');
var ArchiveListView = require('./archive_list_view');

var AllArchiveView = BaseView.extend({
	id: 'all-archive-screen',
  template: require('./templates/all_archive'),


	initialize: function () {
		this.collection = window.archiveCollection;
		BaseView.prototype.initialize.call(this);
	},

  getRenderData: function () {
    return {numberArchives: this.collection.length}
  },

	afterRender: function () {
		this.collectionView = new ArchiveListView({
			collection: this.collection,
		});
		this.collectionView.render();
	},
});

module.exports = AllArchiveView;

});

require.register("private/views/allArchives/archive_list_view", function(exports, require, module) {
var ViewCollection = require('../../lib/view_collection');
var ArchiveRowView = require('./archive_row_view');

var ArchiveListView = ViewCollection.extend({
	el: '#list-view',

	itemView: ArchiveRowView,

	initialize: function () {
		this.collection = window.archiveCollection;
		ViewCollection.prototype.initialize.call(this);
	}
});

module.exports = ArchiveListView;

});

require.register("private/views/allArchives/archive_row_view", function(exports, require, module) {
var BaseView = require('../../lib/base_view');

var app = require('../../application');

var ArchiveRowView = BaseView.extend({
	template: require('./templates/archive_row'),

	events: {
		'click .archive-see-count'	: 'seeArchive',
	},

	getRenderData: function () {
		return ({model: this.model.toJSON()});
	},


	seeArchive: function () {
		app.router.navigate('archive/' + this.model.get('name'), {trigger: true});
	},
});

module.exports = ArchiveRowView;

});

require.register("private/views/allArchives/templates/all_archive", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
var locals_ = (locals || {}),numberArchives = locals_.numberArchives;
buf.push("<div class=\"panel panel-default\"><div class=\"panel-body\">");
if ( numberArchives > 0)
{
buf.push("<ul id=\"list-view\" class=\"nav nav-sidebar\"></ul>");
}
else
{
buf.push("<div class=\"page-header\"><h1>No archive yet</h1><p>When you archieve some account you can find it here :)</p></div>");
}
buf.push("</div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("private/views/allArchives/templates/archive_row", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
var locals_ = (locals || {}),model = locals_.model;
buf.push("<div class=\"panel panel-primary\"><div class=\"panel-heading\">" + (jade.escape((jade_interp = model.name) == null ? '' : jade_interp)) + "</div><div class=\"panel-body\"><label for=\"description\">Description</label><div id=\"description\" class=\"form-group\"><p>" + (jade.escape((jade_interp = model.description) == null ? '' : jade_interp)) + "</p></div><label for=\"user-list\">Users</label><div id=\"user-list\" class=\"form-group\">");
// iterate model.users
;(function(){
  var $$obj = model.users;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var user = $$obj[$index];

buf.push("<button" + (jade.attr("style", "background-color: #" + (user.color) + "", true, false)) + " class=\"btn\">" + (jade.escape((jade_interp = user.name) == null ? '' : jade_interp)) + "</button>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var user = $$obj[$index];

buf.push("<button" + (jade.attr("style", "background-color: #" + (user.color) + "", true, false)) + " class=\"btn\">" + (jade.escape((jade_interp = user.name) == null ? '' : jade_interp)) + "</button>");
    }

  }
}).call(this);

buf.push("</div><div class=\"form-group\"><button class=\"archive-see-count btn btn-primary btn-block\">See</button></div></div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("private/views/allCount/all_count_view", function(exports, require, module) {
var BaseView = require('../../lib/base_view');
var CountListView = require('./count_list_view');

var AllCountView = BaseView.extend({
	id: 'all-count-screen',
  template: require('./templates/all_count'),

	events: {
		'click #create-new-count' : 'createNewCount',
	},


	initialize: function (attributes) {
		this.collection = window.countCollection;
		BaseView.prototype.initialize.call(this);
	},


	afterRender: function () {
		this.collectionView = new CountListView({
			collection: this.collection,
		});
		this.collectionView.render();
	},


	createNewCount: function () {
		app.router.navigate('count/create', {trigger: true});
	},

});

module.exports = AllCountView;

});

require.register("private/views/allCount/count_list_view", function(exports, require, module) {

var ViewCollection = require('../../lib/view_collection');
var CountRowView = require('./count_row_view');

var CountListView = ViewCollection.extend({
	el: '#list-view',

	itemView: CountRowView,

	initialize: function () {
		this.collection = window.countCollection;
		ViewCollection.prototype.initialize.call(this);
	}
});

module.exports = CountListView;

});

require.register("private/views/allCount/count_row_view", function(exports, require, module) {
var BaseView = require('../../lib/base_view');

var app = require('../../application');

var CountRowView = BaseView.extend({
	template: require('./templates/count_row'),

	events: {
		'click .count-delete' : 'deleteCount',
		'click .count-modify' : 'modifyCount',
		'click .count-see'		: 'seeCount',
	},

	getRenderData: function () {
		return ({model: this.model.toJSON()});
	},

	deleteCount: function () {
		window.countCollection.remove(this);
		this.model.destroy();
		if (window.countCollection.length === 0) {
			app.router.navigate('count/create', {trigger: true});
		}
	},


	modifyCount: function () {
		app.router.navigate('count/update/' + this.model.id, {trigger: true});
	},


	seeCount: function () {
		app.router.navigate('count/' + this.model.get('name'), {trigger: true});
	}

});

module.exports = CountRowView;

});

require.register("private/views/allCount/templates/all_count", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<div class=\"panel panel-default\"><div class=\"panel-body\"><ul id=\"list-view\" class=\"nav nav-sidebar\"><button id=\"create-new-count\" class=\"btn btn-default\">Create New Count</button></ul></div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("private/views/allCount/templates/count_row", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
var locals_ = (locals || {}),model = locals_.model;
buf.push("<div class=\"panel panel-primary\"><div class=\"panel-heading\">" + (jade.escape((jade_interp = model.name) == null ? '' : jade_interp)) + "</div><div class=\"panel-body\">");
if ( model.description)
{
buf.push("<label for=\"description\">Description</label><div id=\"description\" class=\"form-group\"><p>" + (jade.escape((jade_interp = model.description) == null ? '' : jade_interp)) + "</p></div>");
}
buf.push("<label for=\"user-list\">Users</label><div id=\"user-list\" class=\"form-group\">");
// iterate model.users
;(function(){
  var $$obj = model.users;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var user = $$obj[$index];

buf.push("<button" + (jade.attr("style", "background-color: #" + (user.color) + "", true, false)) + " class=\"btn\">" + (jade.escape((jade_interp = user.name) == null ? '' : jade_interp)) + "</button>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var user = $$obj[$index];

buf.push("<button" + (jade.attr("style", "background-color: #" + (user.color) + "", true, false)) + " class=\"btn\">" + (jade.escape((jade_interp = user.name) == null ? '' : jade_interp)) + "</button>");
    }

  }
}).call(this);

buf.push("</div><div class=\"form-group\"><button class=\"count-see btn btn-default btn-block\">See</button><button class=\"count-modify btn btn-default btn-block\">Modify</button><button class=\"count-delete btn btn-default btn-block\">Delete</button></div></div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("private/views/count/archive_view", function(exports, require, module) {
var CountBaseView = require('./count_base_view');
var app = require('../../application');

/*
 * View for all the archived count, based on the countBaseView (as count).
 * Shorter because an archive can't be modified
 */
var ArchiveView = CountBaseView.extend({
	id: 'archive-screen',

	count: null,
	dataResume: {
		allExpense: 0,
	},

	newExpense: null,
	balancing: null,

	events: {
		'click #header-balancing'			: 'printBalancing',
	},

	initialize: function (attributes) {
		this.count = window.archiveCollection.models.find(function (count) {
			if (count.get('name') == attributes.countName) {
				return true;
			}
			return false;
		});

		CountBaseView.prototype.initialize.call(this);
	},


});

module.exports = ArchiveView;

});

require.register("private/views/count/count_base_view", function(exports, require, module) {
// Requirements
var BaseView = require('../../lib/base_view');
var app = require('../../application');

// Modules
var StatsView = require('./stats_view');
var SquareView = require('./square_view');


/*
 * CountBaseView is a generique class wiche is call in count and archive. There
 * are both exactly the same stucture but just more or less actions
 */
var CountBaseView = BaseView.extend({
  template: require('./templates/count'),


  /*
   * If count is undefined that mean I haven't find it in the collection so it's
   * a bad url. I redirect to the mainBoard
   */
	initialize: function () {
		if (this.count == undefined || this.count == null) {
			console.error('invalide route');
      app.router.navigate('', {trigger: true});
		}

		BaseView.prototype.initialize.call(this);
	},


  /*
   * Call in render in BaseView class. Render the data to the template
   */
	getRenderData: function () {
		if (this.count !== null && this.count !== undefined) {
      var expensePerUser = +(Math.round(this.count.get('allExpenses') /
            this.count.get('users').length * 100) / 100).toFixed(2);

			return ({
        count: this.count.toJSON(),
        expensePerUser: expensePerUser
      });
		}
	},


  /*
   * Render stats module
   */
	afterRender: function () {
      if (this.count.get('expenses').length > 0) {
        this.stats = new StatsView({count: this.count});
        this.stats.render();
      }
	},


  /*
   * The balancing is by default not printed so I don't create it unless it's
   * required.
   */
	printBalancing: function () {
		if (this.balancing === null || this.balancing === undefined) {
			this.balancing = new SquareView({count: this.count});
			this.balancing.render();
		}
		this.balancing.clickDisplayer()
	},
});

module.exports = CountBaseView;

});

require.register("private/views/count/count_view", function(exports, require, module) {
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
    'click #count-lauch-add-user'	: 'addUser',
    'click #add-new-expense'		: 'lauchNewExpense',
    'click .header-expense-elem'	: 'printTransferBody',
    'click .delete-expense-elem'	: 'deleteExpense',
    'click #header-balancing'		: 'printBalancing',
  },


  /*
   * If we are in 'cozy navigation' we get the name of the class and
   * check in the collection if he can find it. Else if we are in public
   * navigation there must be juste one count available, set in the router
   */
  initialize: function (attributes) {
    this.count = window.countCollection.models.find(function (count) {
      if (count.get('name') == attributes.countName) {
        return true;
      }
      return false;
    });

    CountBaseView.prototype.initialize.call(this);
  },


  /*
   * All the process for add a user in the count
   */
  addUser: function () {
    var userList = this.count.get('users');
    var newUser = this.$('#count-input-add-user').val();
    var color = colorSet[userList.length % colorSet.length];

    // Remove precedent alert
    this.$('#alert-name').remove();

    // Check if the name is taker
    var nameIsTaken = userList.find(function (elem) {
      if (elem.name === newUser) {
        return true;
      }
      return false;
    });

    // Print an alert and quit if the name is taken
    if (nameIsTaken !== undefined) {
      this.$('#name-alert').append('<div id="alert-name" class="alert alert-danger" role="alert"><a href="#" class="close" data-dismiss="alert">&times;</a>Name already taken</div>');
      return;
    }

    // Add the name to the userlist if not taken
    userList.push({name: newUser, seed: 0, leech: 0, color: color});
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
   * The new expense editor is manage in a new page in order to make this page
   * lighter in code and informations. It's also easier we re-render the count
   * with the new data so we haven't to handle this manually.
   */
  lauchNewExpense: function (event) {
    app.router.navigate('count/' + this.count.get('name') + '/new-expense', {trigger: true});
  },


  /*
   * Remove an expense
   */
  removeNewExpense: function () {
    this.newExpense.remove();
    delete this.newExpense;
    this.newExpense= null;

    // Remove the div
    this.$('#module').prepend('<button id="add-new-expense" class="btn btn-default btn-block"> Add a new expense</button>');
  },


  /*
   * Print expand or remove data body of an element of the history
   */
  printTransferBody: function (event) {
    var elem =  $(event.target);
    if (elem.is('span')) {
      var expenseBody =  $(event.target).parent().next('div');
    } else {
      var expenseBody =  $(event.target).next('div');
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
      var self = this;
      var id = Number(this.$(event.target).parent().attr('id'));

      this.count.removeExpense(id);
    },

});

module.exports = CountView;

});

require.register("private/views/count/square_view", function(exports, require, module) {
var BaseView = require('../../lib/base_view');
var app = require('../../application');

/*
 * Specific view Wiche manage the balancing module.
 *
 * TODO: Separate with a model
 */
var SquareView = BaseView.extend({
	id: 'square-view',
	template: require('./templates/square'),


	events: {
		'click #archive-count': 'archive',
	},


	initialize: function (attributes) {
		this.count = attributes.count;

		this.setUsersBalancing();

		BaseView.prototype.initialize.call(this);
	},


	render: function () {
		$('#module-balancing').prepend(this.$el);
		this.$el.html(this.template({users: this.usersBalancing, squareMoves: this.squareMoves}));
		this.$('#square-displayer').slideDown('slow');

	},


  /*
   * Print or remove the body of the balancing module
   */
	clickDisplayer: function () {
		var displayer = this.$('#square-displayer');

		if (displayer.is('.printed')) {
			displayer.slideUp('slow');
			displayer.removeClass('printed');
		} else {
			displayer.slideDown('slow');
			displayer.addClass('printed');
		}
	},


  /*
   * Update and rerender the balancing
   * TODO: make a manual update to changing directly the values not a
   * remove/rerender because that trigger a slide up/slide down and it's visible
   */
	update: function () {
		this.setUsersBalancing();
		this.setSquareMoves();
		this.remove();
		this.render();
	},


  /*
   * Create an array with the name, color and balancing of each user
   */
	setUsersBalancing: function () {
		var allExpenses = this.count.get('allExpenses');
		var users = this.count.get('users');

		this.usersBalancing = users.map(function (user) {
			return {
				name: user.name,
				color: user.color,
				balancing: (Math.round((user.seed - user.leech) * 100) / 100).toFixed(2)
			}
		});

		this.setSquareMoves();
	},


  /*
   * Calcule each moves to balancing the count
   */
	setSquareMoves: function () {
		this.squareMoves = [];

    // copy the userBalancing array
		var tmpUsers = JSON.parse(JSON.stringify(this.usersBalancing));

		var i = 0;

    /*
     * The main loop: in each loop we find the biggest leecher and the biggest
     * seeder and we equalise between their. If one of them have is balancing to
     * 0 I remove it.
     *
     * Repeate the loop while it stay 1 or less user. If one user stay it's the
     * a "lost", I can't redistribute to any user. The goal it's to make this
     * lost tinier possible. For now it's max "0.01 * (nb or user -1)"
     */
		while (tmpUsers.length > 1 && i++ < 50) {
			var leecher = null;
			var indexLeecher = 0;

      // Find the biggest leecher
			for (index in tmpUsers) {
				if (leecher === null || (leecher.balancing > tmpUsers[index].balancing && leecher != tmpUsers[index])) {
					leecher = {
						name: tmpUsers[index].name,
						balancing: Number(tmpUsers[index].balancing)
					}
					indexLeecher = index;
				}
			}

			var seeder = null;
			var indexSeeder = 0;

      // Find the biggest seeder
			for (index in tmpUsers) {
				if (seeder === null || (seeder.balancing < tmpUsers[index].balancing && seeder != tmpUsers[index])) {
					seeder = {
						name: tmpUsers[index].name,
						balancing: Number(tmpUsers[index].balancing)
					}
					indexSeeder = index;
				}
			}

      // Set the amount I can send from the leecher to the seeder to equalize a
      // max
			if (leecher.balancing * -1 > seeder.balancing) {
				exchange = seeder.balancing;
			} else {
				exchange = - leecher.balancing;
			}

      // Set the new balancin
			seeder.balancing = (Math.round((seeder.balancing - exchange) * 100) / 100).toFixed(2);
			leecher.balancing = (Math.round((leecher.balancing + exchange) * 100) / 100).toFixed(2);

      // Add the exchange to the list of exchanges
			if (exchange !== 0 && exchange !== 'NaN') {
				this.squareMoves.push({
					from: leecher.name,
					to: seeder.name,
					exchange: exchange
				});
			}

      // Remove the leecher of the seeder if their balancing is equal to 0
			if (leecher.balancing == 0) {
				tmpUsers.splice(indexLeecher, 1);
			}
			if (seeder.balancing == 0) {
				tmpUsers.splice(indexSeeder, 1);
			}
		}
	},


  /*
   * Archive a count
   */
	archive: function (event) {
		this.count.archive();
	},


	resetSquare: function () {
		this.trigger('remove-module');
	},
});

module.exports = SquareView;

});

require.register("private/views/count/stats_view", function(exports, require, module) {

var BaseView = require('../../lib/base_view');


/*
 * Manage all stats in stats module
 */
var StatsView = BaseView.extend({
  el: '#stats-module',


  initialize: function (attributes) {
    this.count = attributes.count;

    BaseView.prototype.initialize.call(this);
  },



  /*
   * Create the pie chart and reder it
   */
  render: function () {
    var chartCtx = this.$('#chart-users').get(0).getContext("2d");
    var data = this.computeDataCount();
    this.pieChart = new Chart(chartCtx).Pie(data);
  },


  /*
   * Compute data needed for the pie chart. We don't add the user with 0 seed
   * because the update don't work from 0 to X value.
   */
  computeDataCount: function () {
    var data = [];
    this.count.get('users').forEach(function (elem) {
      if (Number(elem.seed) !== 0) {
        data.push({value: elem.seed, color: '#'+elem.color, label: elem.name});
      }
    });
    return data;
  },


  /*
   * Update the value of the pie chart
   */
  update: function () {
    var allExpenses = Number(this.count.get('allExpenses'));
    var nbUsers = Number(this.count.get('users').length);

    var perUserExpenses = +(Math.round(allExpenses / nbUsers * 100) / 100).toFixed(2);

    // Update the numbers of the general state (to the right of the pie chart)
    $('#nb-expenses').text(this.count.get('expenses').length);
    $('#all-expenses').text(allExpenses);
    $('#perUser-expenses').text(perUserExpenses);

    var self = this;

    /*
     * Main loop wiche I update/ create data to the pie chart
     */
    this.count.get('users').forEach(function (user, indexUser) {
      var indexPie = null;
      // For each user we looking him in the data of the pie chart
      self.pieChart.segments.find(function (pieSegment, index) {
        if (pieSegment.label === user.name) {
          indexPie = index;
          return true;
        }
        return false;
      })
      // If we find it we update the chart with the new data in the segment
      if (indexPie !== undefined && indexPie !== null) {
        if (user.seed == 0) {
          self.pieChart.removeData(indexPie);
        } else {
          self.pieChart.segments[indexPie].value = user.seed;
          self.pieChart.update();
        }
        // If not we create a new segment
      } else {
        self.pieChart.addData({
          value: user.seed,
          color: '#' + user.color,
          label: user.name
        });
      }
    });
  },

});

module.exports = StatsView;

});

require.register("private/views/count/templates/count", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
var locals_ = (locals || {}),count = locals_.count,expensePerUser = locals_.expensePerUser;
buf.push("<div class=\"panel panel-default\"><div class=\"panel-body\"><div class=\"panel panel-primary\"><div class=\"panel-heading\">Users</div><div class=\"panel-body\"><div id=\"stats-module\"><div class=\"col-md-4\"><div id=\"user-list\" class=\"col-md-12\">");
// iterate count.users
;(function(){
  var $$obj = count.users;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var user = $$obj[$index];

buf.push("<div class=\"row\"><button" + (jade.attr("style", "background-color: #" + (user.color) + "", true, false)) + " class=\"btn\">" + (jade.escape((jade_interp = user.name) == null ? '' : jade_interp)) + "</button></div>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var user = $$obj[$index];

buf.push("<div class=\"row\"><button" + (jade.attr("style", "background-color: #" + (user.color) + "", true, false)) + " class=\"btn\">" + (jade.escape((jade_interp = user.name) == null ? '' : jade_interp)) + "</button></div>");
    }

  }
}).call(this);

buf.push("</div>");
if ( count.status == 'active')
{
buf.push("<div id=\"name-alert\" class=\"row col-md-8\"><div class=\"input-group\"><form><input id=\"count-input-add-user\" type=\"text\" placeholder=\"My name\" class=\"form-control\"/><span class=\"input-group-btn\"><input id=\"count-lauch-add-user\" type=\"submit\" value=\"Add user\" class=\"btn btn-default\"/></span></form></div></div>");
}
buf.push("</div>");
if ( count.expenses.length > 0)
{
buf.push("<div id=\"canvas-block\" class=\"col-md-4 col-xs-6\"><h4>Expenses per users</h4><canvas id=\"chart-users\" width=\"150\" height=\"150\"></canvas></div>");
}
buf.push("</div><div class=\"col-md-4 col-xs-6\"><label for=\"all-expenses\">All Expenses:</label><p id=\"all-expenses\">" + (jade.escape((jade_interp = count.allExpenses) == null ? '' : jade_interp)) + "</p><label for=\"nb-expenses\">Number Expenses:</label><p id=\"nb-expenses\">" + (jade.escape((jade_interp = count.expenses.length) == null ? '' : jade_interp)) + "</p><label for=\"nb-expenses\">Expenses per user:</label><p id=\"perUser-expenses\">" + (jade.escape((jade_interp = expensePerUser) == null ? '' : jade_interp)) + "</p></div></div>");
if ( (count.status == 'active'))
{
buf.push("<div class=\"btn-group btn-block\"><button id=\"add-new-expense\" type=\"button\" data-toggle=\"dropdown\" class=\"btn btn-lg btn-success btn-block\"><span>&nbsp;Add an expense&nbsp;</span></button></div>");
}
buf.push("</div><div class=\"panel panel-primary\"><div id=\"header-balancing\" class=\"panel-heading\"><span class=\"caret\"></span><span>&nbsp;Balancing</span></div><div id=\"module-balancing\"></div></div><div class=\"panel panel-primary\"><div class=\"panel-heading\">History</div><div class=\"panel-body\"><div id=\"expense-list-view\">");
if ( count.expenses.length == 0)
{
buf.push("<span id=\"empty-history\">Your history is empty</span>");
}
else
{
// iterate count.expenses
;(function(){
  var $$obj = count.expenses;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var expense = $$obj[$index];

buf.push("<div class=\"panel panel-default\"><div class=\"panel-heading header-expense-elem\"><span class=\"caret\"></span><span> " + (jade.escape((jade_interp = expense.name) == null ? '' : jade_interp)) + "</span><span style=\"float: right\">" + (jade.escape((jade_interp = expense.amount) == null ? '' : jade_interp)) + " " + (jade.escape((jade_interp = expense.currency.name) == null ? '' : jade_interp)) + "</span></div><div style=\"display: none\"" + (jade.attr("id", "" + (expense.id) + "", true, false)) + " class=\"panel-body\"><label for=\"seeder\">Who have paid ?</label><div id=\"seeder\"></div><button class=\"btn\">" + (jade.escape((jade_interp = expense.seeder) == null ? '' : jade_interp)) + "</button><div class=\"form-group\"><label for=\"leecher-list\">Who contribute ?</label><div id=\"leecher-list\" class=\"form-group\">");
// iterate expense.leecher
;(function(){
  var $$obj = expense.leecher;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var leecher = $$obj[$index];

buf.push("<button class=\"btn\">" + (jade.escape((jade_interp = leecher.name) == null ? '' : jade_interp)) + "</button>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var leecher = $$obj[$index];

buf.push("<button class=\"btn\">" + (jade.escape((jade_interp = leecher.name) == null ? '' : jade_interp)) + "</button>");
    }

  }
}).call(this);

buf.push("</div></div><button class=\"btn btn-default btn-block delete-expense-elem\">Delete</button></div></div>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var expense = $$obj[$index];

buf.push("<div class=\"panel panel-default\"><div class=\"panel-heading header-expense-elem\"><span class=\"caret\"></span><span> " + (jade.escape((jade_interp = expense.name) == null ? '' : jade_interp)) + "</span><span style=\"float: right\">" + (jade.escape((jade_interp = expense.amount) == null ? '' : jade_interp)) + " " + (jade.escape((jade_interp = expense.currency.name) == null ? '' : jade_interp)) + "</span></div><div style=\"display: none\"" + (jade.attr("id", "" + (expense.id) + "", true, false)) + " class=\"panel-body\"><label for=\"seeder\">Who have paid ?</label><div id=\"seeder\"></div><button class=\"btn\">" + (jade.escape((jade_interp = expense.seeder) == null ? '' : jade_interp)) + "</button><div class=\"form-group\"><label for=\"leecher-list\">Who contribute ?</label><div id=\"leecher-list\" class=\"form-group\">");
// iterate expense.leecher
;(function(){
  var $$obj = expense.leecher;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var leecher = $$obj[$index];

buf.push("<button class=\"btn\">" + (jade.escape((jade_interp = leecher.name) == null ? '' : jade_interp)) + "</button>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var leecher = $$obj[$index];

buf.push("<button class=\"btn\">" + (jade.escape((jade_interp = leecher.name) == null ? '' : jade_interp)) + "</button>");
    }

  }
}).call(this);

buf.push("</div></div><button class=\"btn btn-default btn-block delete-expense-elem\">Delete</button></div></div>");
    }

  }
}).call(this);

}
buf.push("</div></div></div></div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("private/views/count/templates/square", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
var locals_ = (locals || {}),users = locals_.users,squareMoves = locals_.squareMoves;
buf.push("<div id=\"square-displayer\" style=\"display: none\" class=\"panel-body\"><label for=\"balancing\">Balancing:</label><ul id=\"balancing\">");
// iterate users
;(function(){
  var $$obj = users;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var user = $$obj[$index];

buf.push("<li><button" + (jade.attr("style", "background-color: #" + (user.color) + "", true, false)) + " class=\"btn\">" + (jade.escape((jade_interp = user.name) == null ? '' : jade_interp)) + ":</button>");
if ( user.balancing == 0)
{
buf.push("<span style=\"color: blue\">&nbsp;ok</span>");
}
if ( user.balancing > 0)
{
buf.push("<span style=\"color: green\">&nbsp;+" + (jade.escape((jade_interp = user.balancing) == null ? '' : jade_interp)) + "</span>");
}
if ( user.balancing < 0)
{
buf.push("<span style=\"color: red\">&nbsp;" + (jade.escape((jade_interp = user.balancing) == null ? '' : jade_interp)) + "</span>");
}
buf.push("</li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var user = $$obj[$index];

buf.push("<li><button" + (jade.attr("style", "background-color: #" + (user.color) + "", true, false)) + " class=\"btn\">" + (jade.escape((jade_interp = user.name) == null ? '' : jade_interp)) + ":</button>");
if ( user.balancing == 0)
{
buf.push("<span style=\"color: blue\">&nbsp;ok</span>");
}
if ( user.balancing > 0)
{
buf.push("<span style=\"color: green\">&nbsp;+" + (jade.escape((jade_interp = user.balancing) == null ? '' : jade_interp)) + "</span>");
}
if ( user.balancing < 0)
{
buf.push("<span style=\"color: red\">&nbsp;" + (jade.escape((jade_interp = user.balancing) == null ? '' : jade_interp)) + "</span>");
}
buf.push("</li>");
    }

  }
}).call(this);

buf.push("</ul><label for=\"balancing\">How to be square:</label><ul id=\"square\">");
// iterate squareMoves
;(function(){
  var $$obj = squareMoves;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var move = $$obj[$index];

buf.push("<li>[" + (jade.escape((jade_interp = move.from) == null ? '' : jade_interp)) + "] gave [" + (jade.escape((jade_interp = move.exchange) == null ? '' : jade_interp)) + "] to [" + (jade.escape((jade_interp = move.to) == null ? '' : jade_interp)) + "]</li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var move = $$obj[$index];

buf.push("<li>[" + (jade.escape((jade_interp = move.from) == null ? '' : jade_interp)) + "] gave [" + (jade.escape((jade_interp = move.exchange) == null ? '' : jade_interp)) + "] to [" + (jade.escape((jade_interp = move.to) == null ? '' : jade_interp)) + "]</li>");
    }

  }
}).call(this);

buf.push("</ul><button id=\"archive-count\" class=\"btn btn-primary btn-block\">Close and archive</button></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("private/views/countEditor/count_creation_view", function(exports, require, module) {
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

});

require.register("private/views/countEditor/count_edition_base", function(exports, require, module) {
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
var CountEditorBase = BaseView.extend({
  id: 'count-editor-screen',


  /*
   * Add a listener in the changes of the input of name
   */
  afterRender: function () {
    this.$('#input-name')[0].addEventListener('change', (function(_this) {
      return function (event) {_this.checkCountName(event);};
    })(this));
    if (this.count !== null && this.count.get('isPublic') == true) {
      this.setPublic();
      this.$('#input-public').attr('checked');
    }
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
      return countName;
    }
  },


    errorMessage: function (msg) {
      this.$('#alert-zone').append('<div class="alert alert-danger" role="alert"><a href="#" class="close" data-dismiss="alert">&times;</a>'+msg+'</div>');
    },
});

module.exports = CountEditorBase;

});

require.register("private/views/countEditor/count_update_view", function(exports, require, module) {
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
var CountUpdateView = CountEditionBase.extend({
  id: 'count-editor-screen',
  template: require('./templates/count_update'),
  templateUrl: require('./templates/url'),

  events: {
    'click #submit-editor'  : 'lauchCountUpdate',
    'click #input-public'   : 'changePublicStatus'
  },


  initialize: function (params) {

    this.count = params.count;

    if (this.count == null || this.count == undefined) {
      console.error("Error: retrieve count update");
    }

    BaseView.prototype.initialize.call(this);
  },


  /*
   * Add a listener in the changes on the input of name. That permit a dynamique
   * warning.
   */
  afterRender: function () {
    this.$('#input-name')[0].addEventListener('change', (function(_this) {
      return function (event) {
        var res = _this.checkCountName(event);
        if (res != null) {
          _this.count.set('name', res);
        }
      };
    })(this));

    if (this.count !== null && this.count.get('isPublic') == true) {
      this.setPublic();
    }
  },


  /*
   * Set the variable <this.isPublic> which will set the credential to the futur
   * access from the public area.
   */
  changePublicStatus: function () {
    if (this.count.get('isPublic') == false) {
      this.setPublic();
    } else {
      this.setPrivate();
    }
  },

  setPublic: function () {
    this.count.set('isPublic', true);
    this.$('#input-public').text('Make this count private');
    this.$('#public-section').append(this.templateUrl({url: this.createPublicUrl()}))
  },


  setPrivate: function () {
    this.count.set('isPublic', false);
    this.$('#input-public').text('Make this count public');
    this.$('#public-section-body').remove();
  },

  /*
   *
   */
  createPublicUrl: function () {

    if (window.domain == false || window.domain == undefined || window.domain == null) {
      return (window.location.origin + '/public/count/' + this.count.id);
    } else {
      return (window.domain + '/public/count/' + this.count.id);
    }
  },



  getRenderData: function () {
    if (this.count != null) {
      return ({model: this.count.toJSON()});
    }
    return ({model: null});
  },


  /*
   * Lauche an update server side
   * TODO: improve it and ckeck if name is already taken
   */
  lauchCountUpdate: function () {
    this.count.set('description', this.$('#input-description').val());

    this.count.save(this.count.attributes, {
      error: function (xhr) {
        console.error (xhr);
      },
      success: function (data) {
        app.router.navigate('/count/' + data.get('name'), {trigger: true});
      }
    });
  },
});

module.exports = CountUpdateView;

});

require.register("private/views/countEditor/templates/count_creation", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<div class=\"page-header\"><h1>New count</h1><p>A new count is juste a folder where you can put some friends and</p>create a fictional history of who paid what and who owe who.</div><div id=\"formular\"><div id=\"input-name-grp\" class=\"form-group\"><label for=\"input-name\">Count Name</label><input id=\"input-name\" type=\"text\" placeholder=\"Name\" class=\"form-control\"/></div><div class=\"form-group\"><label for=\"input-description\">Count Description</label><input id=\"input-description\" type=\"text\" placeholder=\"Description\" class=\"form-control\"/></div><label for=\"currency\">Count Currencies</label><div id=\"currency\" class=\"form-group\"><div id=\"currencies-list\" data-toggle=\"buttons\" class=\"btn-group\"><label class=\"btn btn-primary currency\"><input type=\"checkbox\", autocomplete=\"off\", value=\"€\"> €</label><label class=\"btn btn-primary currency\"><input type=\"checkbox\", autocomplete=\"off\", value=\"$\"> $</label></div></div><div class=\"form-group\"><div id=\"list-users\" class=\"btn-group\"></div></div><label for=\"input-user-grp\">Count Users</label><div id=\"input-user-grp\" class=\"form-group\"><div class=\"input-group\"><form><input id=\"input-users\" type=\"text\" placeholder=\"My name\" class=\"form-control\"/><span class=\"input-group-btn\"><input id=\"add-user\" type=\"submit\" value=\"Add user\" class=\"btn btn-default\"/></span></form></div></div><div id=\"name-alert\"></div><button id=\"submit-editor\" class=\"btn btn-default\">Submit</button></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("private/views/countEditor/templates/count_update", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
var locals_ = (locals || {}),model = locals_.model;
buf.push("<h1>" + (jade.escape((jade_interp = model.name) == null ? '' : jade_interp)) + "</h1><form><div class=\"form-group\"><label for=\"input-name\">Count Name</label><input id=\"input-name\" type=\"text\" placeholder=\"Name\"" + (jade.attr("value", "" + (model.name) + "", true, false)) + " class=\"form-control\"/></div><div class=\"form-group\"><label for=\"input-description\">Count Description</label><input id=\"input-description\" type=\"text\" placeholder=\"Description\"" + (jade.attr("value", "" + (model.description) + "", true, false)) + " class=\"form-control\"/></div><div class=\"panel panel-primary\"><div class=\"panel-heading\">Public</div><div class=\"panel-body\"><div id=\"public-section\" class=\"col-md-6\"><div class=\"form-group\"><div data-toggle=\"buttons\" class=\"btn-group\"><label id=\"input-public\" class=\"btn btn-primary leecher\">");
if ( model.isPublic)
{
buf.push("<input type='checkbox' autocomplete=\"off\"><Make>this count private</Make>");
}
else
{
buf.push("<input id=\"input-public\" type='checkbox' autocomplete=\"off\"> Make this count public");
}
buf.push("</label></div></div></div><div class=\"col-md-6\"><p>You can make this count public, which mean that everyone who try to</p><access>the address below will see the count and will have the</access><possibility>to modify it.</possibility></div></div></div><button id=\"submit-editor\" class=\"btn btn-default\">Submit</button></form>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("private/views/countEditor/templates/url", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
var locals_ = (locals || {}),url = locals_.url;
buf.push("<div id=\"public-section-body\"><label for=\"public-url\">Url to share:</label><p id=\"public-url\"> " + (jade.escape((jade_interp = url) == null ? '' : jade_interp)) + "</p></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("private/views/menu/count_list_view", function(exports, require, module) {

var ViewCollection = require('../../lib/view_collection');
var MenuCountRowView = require('./count_row_view');

/*
 * Manage the name of the count in the menu. That's work as a ViewCollection
 * linked to a collection. If you add a model to the collection it will be
 * automatically add to the viewcollection
 */
var MenuCountListView = ViewCollection.extend({
	el: '#menu-list-count',

	itemView: MenuCountRowView,

  /*
   * Link the viewCollection to the collection
   */
	initialize: function (collection) {
		this.collection = collection;
		ViewCollection.prototype.initialize.call(this);
	},
});

module.exports = MenuCountListView;

});

require.register("private/views/menu/count_row_view", function(exports, require, module) {
var BaseView = require('../../lib/base_view');
var app = require('../../application');

/*
 * This view represente an element of the viewCollection countListView
 */
var MenuCountRowView = BaseView.extend({
  //template: require('./templates/count_row'),

  tagName: 'li',

  /*
   * Lauch the click listener to render the count
   */
  initialize: function () {
    var self = this;
    this.$el.click(function () {
      self.printCount();
    })
  },


  getRenderData: function () {
    return ({model: this.model.toJSON()});
  },

  render: function () {
    name = this.model.get('name')
    this.$el.html('<a id="count-' + name +'">'+ name+'</a>');
    this.afterRender();
    return this;
  },


  /*
   * Reroute  to the count url -> show the view main page
   */
  printCount: function () {
    app.router.navigate('count/' + this.model.get('name'), {trigger: true});
  },
});

module.exports = MenuCountRowView;

});

require.register("private/views/menu/menu_view", function(exports, require, module) {
var BaseView = require('../../lib/base_view');
var CountListView = require('./count_list_view');
var app = require('../../application');

/*
 * Main view for the sidemenu. Contain the viewCollection count_list_view to
 * dynamically create a list of the count name  and redirect to the good url.
 */
var MenuView = BaseView.extend({
	el: '#sidebar',

	events: {
		'click #menu-all-count'		: 'goHomeView',
		'click #menu-add-count'		: 'createNewCount',
		'click #menu-archives'		: 'goToArchives',
	},

  /*
   * Render the list of count in the menu
   */
	renderCounts: function () {
		this.countCollectionView = new CountListView(window.countCollection);
		this.countCollectionView.render();
	},


  /*
   * Redirect to the mainBoard
   */
	goHomeView: function () {
		app.router.navigate('', {trigger: true});
	},


  /*
   * Redirect to the count creation
   */
	createNewCount: function () {
		app.router.navigate('count/create', {trigger: true});
	},


  /*
   * Redirect to the archive list
   */
	goToArchives: function () {
		app.router.navigate('archive', {trigger: true});
	},

});

module.exports = MenuView;

});

require.register("private/views/menu/templates/count_row", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
var locals_ = (locals || {}),model = locals_.model;
buf.push("<a" + (jade.attr("id", "count-" + (model.name) + "", true, false)) + ">" + (jade.escape((jade_interp = model.name) == null ? '' : jade_interp)) + "</a>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("private/views/newEvent/expense/new_expense_view", function(exports, require, module) {
var BaseView = require('../../../lib/base_view');
var app = require('../../../application');


/*
 * View for adding an expense to the count. That's manage in a new view to make
 * more easy the history rendering if we add a new expense.
 */
var AddExpenseView = BaseView.extend({
  template: require('./templates/new_expense'),
  id: 'new-expense',

  count: null,


  events: {
    'click .seeder'				: 'setSeeder',
    'click .leecher'			: 'setLeecher',
    'click #add-expense-save'	: 'lauchSaveExpense',
    'click #add-expense-cancel'	: 'resetNewExpense',
    'click .currency'			:	'setCurrency',
  },


  /*
   * Find the correct count with the name in attribute. It can be some conflic
   * in the url if two count have the same name, so be carefule.
   */
  initialize: function (attributes) {

    // Find the count
    this.count = window.countCollection.models.find(function (count) {
      if (count.get('name') == attributes.countName) {
        return true;
      }
      return false;
    });

    // If there is no count, it's a bed url so I redirect to the main page
    if (this.count == undefined || this.count == null) {
      console.error('invalide route');
      app.router.navigate('', {trigger: true});
    }

    var leecher = this.count.get('users').map(function (elem) {
      return {name: elem.name};
    });

    this.data = {
      leecher: leecher,
      currency: this.count.get('currencies')[0],
    };

    BaseView.prototype.initialize.call(this);
  },


  getRenderData: function () {
    return {
      currencies: this.count.get('currencies'),
      users: this.count.get('users'),
    };
  },

  /*
   * Add all the listener to dynamically check if the inputs are correct
   */
  afterRender: function () {
    this.$('#input-amount')[0].addEventListener('change', (function(_this) {
      return function (event) {_this.data.amount = event.target.value;};
    })(this));

    this.$('#input-name')[0].addEventListener('change', (function(_this) {
      return function (event) {_this.data.name = event.target.value;};
    })(this));

    this.$('#input-description')[0].addEventListener('change', (function(_this) {
      return function (event) {_this.data.description = event.target.value;};
    })(this));
  },


  /*
   * Set the seeder of the expense or "who paid"
   */
  setSeeder: function (event) {
    var target = this.$(event.target).children().get(0).value;
    if (this.data.seeder === target) {
      this.data.seeder = null;
    } else {
      this.data.seeder = target;
    }
  },


  /*
   * Set the leechers of the expense or "who take part"
   */
  setLeecher: function (event) {
    var target = this.$(event.target).children().get(0).value;
    var listLeecher = this.data.leecher;
    var leecherIndex = null;;

    listLeecher.find(function (element, index) {
      if (element.name == target) {
        leecherIndex = index;
        return true;
      }
      return false;
    });

    if (leecherIndex === null) {
      listLeecher.push({name: target});
    }
    else {
      listLeecher.splice(leecherIndex, 1);
    }
  },


  /*
   * Set the currency of the expense
   */
    setCurrency: function (event) {
      this.data.currency = event.target.text;
      this.$('#choose-currency').text(this.data.currency);
    },


    /*
     * Check if all inputs are correct and print an alert if it's not, else call
     * sendNewExpense()
     */
  lauchSaveExpense: function () {
    var data = this.data;
    var error = false;

    this.$('#alert-zone').remove();
    this.$('#add-expense-displayer').prepend('<div id="alert-zone"></div>');
    if (data.name === null || data.name == undefined) {
      this.errorMessage('Your expense need a name');
      error = true;
    }
    if (data.seeder === null || data.seeder == undefined) {
      this.errorMessage('One person must paid');
      error = true;
    }
    if (data.amount == undefined) {
      this.errorMessage('You haven\'t set a amount');
      error = true;
    } else if (data.amount <= 0) {
      this.errorMessage('The amount must be positive');
      error = true;
    }
    if (data.leecher.length === 0) {
      this.errorMessage('You must choose almost one persone who get benefice');
      error = true;
    }
    if (error === false) {
      this.sendNewExpense();
    }
  },


  /*
   * Generique function to trigger an alert.
   */
  errorMessage: function (msg) {
    this.$('#alert-zone').append('<div class="alert alert-danger" role="alert">'+msg+'</div>');
  },


  /*
   * Make all cacules to create the set of data to create the bunch of data
   * needer to each expense. I had lost of issues with the number wiche a some
   * time manage as string so I cast everything as Number to be sure.
   *
   * The (Math.round(Num1 +/- Num2) * 100) / 100)toFixed(2) is use to manage the
   * round.
   * TODO: create a generique function to manage round.
   */
    sendNewExpense: function () {
      var self = this;
      var newExpensesList = this.count.get('expenses');
      newExpensesList.push(this.data);

      this.data.id = Date.now() + Math.round(Math.random() % 100);

      var allUsers = this.count.get('users');
      allUsers.every(function (user) {
        if (self.data.seeder === user.name) {
          user.seed = (Math.round((Number(self.data.amount) + Number(user.seed)) * 100) / 100).toFixed(2);
          return false;
        }
        return true;
      });

      var leechPerUser = (Math.round(Number(this.data.amount) / Number(this.data.leecher.length) * 100) / 100).toFixed(2);
      this.data.leecher.forEach(function (elem) {
        allUsers.every(function (user) {
          if (elem.name === user.name) {
            user.leech = +(Math.round((Number(leechPerUser) + Number(user.leech)) * 100) / 100).toFixed(2);
            return false;
          }
          return true;
        });
      });

      var newAllExpenses = (Math.round((Number(this.count.get('allExpenses')) + Number(this.data.amount)) * 100) / 100).toFixed(2);
      this.count.save({
        allExpenses: newAllExpenses,
        expenses: newExpensesList,
        users: allUsers,
      }, {
        wait: true,
        success: function (data) {
          app.router.navigate('/count/' + self.count.get('name'), {trigger: true});
        },
      });
    },

    resetNewExpense: function () {
      app.router.navigate('/count/' + this.count.get('name'), {trigger: true});
    },
});

module.exports = AddExpenseView;

});

require.register("private/views/newEvent/expense/templates/new_expense", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
var locals_ = (locals || {}),currencies = locals_.currencies,users = locals_.users;
buf.push("<form id=\"add-expense-displayer\" class=\"form-group\"><div id=\"alert-zone\"></div><label for=\"input-name\">Expense Name</label><input id=\"input-name\" type=\"text\" placeholder=\"Shopping...\" maxlength=\"40\" required=\"required\" autofocus=\"autofocus\" class=\"form-control\"/><div class=\"form-group\"><label for=\"input-description\">Expense Description</label><textarea id=\"input-description\" rows=\"5\" class=\"form-control\"></textarea></div><div class=\"form-group\"><label for=\"input-amount\">Amount</label><div class=\"input-group\"><input id=\"input-amount\" type=\"number\" placeholder=\"42.21\" aria-label=\"...\" required=\"required\" class=\"form-control\"/><div class=\"input-group-btn\"><button id=\"choose-currency\" type=\"button\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\" class=\"btn btn-default dropdown-toggle\">" + (jade.escape((jade_interp = currencies[0].name) == null ? '' : jade_interp)) + "</button><ul class=\"dropdown-menu dropdown-menu-right\">");
// iterate currencies
;(function(){
  var $$obj = currencies;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var currency = $$obj[$index];

buf.push("<li class=\"currency\"><a>" + (jade.escape((jade_interp = currency.name) == null ? '' : jade_interp)) + "</a></li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var currency = $$obj[$index];

buf.push("<li class=\"currency\"><a>" + (jade.escape((jade_interp = currency.name) == null ? '' : jade_interp)) + "</a></li>");
    }

  }
}).call(this);

buf.push("</ul></div></div></div><label for=\"seeder-list\">Who Paid ?</label><div class=\"form-group\"><div id=\"seeder-list\" data-toggle=\"buttons\" class=\"btn-group\">");
// iterate users
;(function(){
  var $$obj = users;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var user = $$obj[$index];

buf.push("<label class=\"btn btn-primary seeder\"><input type='radio', autocomplete='off', value=\"" + (jade.escape((jade_interp = user.name) == null ? '' : jade_interp)) + "\"> " + (jade.escape((jade_interp = user.name) == null ? '' : jade_interp)) + "</label>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var user = $$obj[$index];

buf.push("<label class=\"btn btn-primary seeder\"><input type='radio', autocomplete='off', value=\"" + (jade.escape((jade_interp = user.name) == null ? '' : jade_interp)) + "\"> " + (jade.escape((jade_interp = user.name) == null ? '' : jade_interp)) + "</label>");
    }

  }
}).call(this);

buf.push("</div></div><label for=\"leecher-list\">Who take Part ?</label><div class=\"form-group\"><div id=\"leecher-list\" data-toggle=\"buttons\" class=\"btn-group\">");
// iterate users
;(function(){
  var $$obj = users;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var user = $$obj[$index];

buf.push("<label class=\"btn btn-primary leecher active\"><input type='checkbox', autocomplete='off', value=\"" + (jade.escape((jade_interp = user.name) == null ? '' : jade_interp)) + "\"> " + (jade.escape((jade_interp = user.name) == null ? '' : jade_interp)) + "</label>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var user = $$obj[$index];

buf.push("<label class=\"btn btn-primary leecher active\"><input type='checkbox', autocomplete='off', value=\"" + (jade.escape((jade_interp = user.name) == null ? '' : jade_interp)) + "\"> " + (jade.escape((jade_interp = user.name) == null ? '' : jade_interp)) + "</label>");
    }

  }
}).call(this);

buf.push("</div></div><div class=\"form-group\"><button id=\"add-expense-save\" type=\"submit\" class=\"btn btn-primary btn-block\">Save</button><button id=\"add-expense-cancel\" class=\"btn btn-primary btn-block\">Cancel</button></div></form>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;
//# sourceMappingURL=app.js.map