(function() {
  'use strict';

  var globals = typeof window === 'undefined' ? global : window;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var has = ({}).hasOwnProperty;

  var aliases = {};

  var endsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  };

  var unalias = function(alias, loaderPath) {
    var start = 0;
    if (loaderPath) {
      if (loaderPath.indexOf('components/' === 0)) {
        start = 'components/'.length;
      }
      if (loaderPath.indexOf('/', start) > 0) {
        loaderPath = loaderPath.substring(start, loaderPath.indexOf('/', start));
      }
    }
    var result = aliases[alias + '/index.js'] || aliases[loaderPath + '/deps/' + alias + '/index.js'];
    if (result) {
      return 'components/' + result.substring(0, result.length - '.js'.length);
    }
    return alias;
  };

  var expand = (function() {
    var reg = /^\.\.?(\/|$)/;
    return function(root, name) {
      var results = [], parts, part;
      parts = (reg.test(name) ? root + '/' + name : name).split('/');
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
  })();
  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
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
  globals.require = require;
})();
require.register("application", function(exports, require, module) {

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

require.register("collections/count_list", function(exports, require, module) {
var Count = require('../models/count');

var CountList = Backbone.Collection.extend({
	model: Count,
	url: 'count',
});

module.exports = CountList;

});

require.register("helper/color_set", function(exports, require, module) {
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

;require.register("initialize", function(exports, require, module) {
var application = require('application');

$(function () {
  application.initialize();

  Backbone.history.start();


  // Lauche listenert for responsive menu
  $('[data-toggle=offcanvas]').click(function() {
    $('.row-offcanvas').toggleClass('active');
  });
});

});

require.register("lib/base_view", function(exports, require, module) {
require('lib/view_helper');

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

require.register("lib/view_collection", function(exports, require, module) {

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

require.register("lib/view_helper", function(exports, require, module) {
// Put your handlebars.js helpers here.

});

;require.register("models/count", function(exports, require, module) {

var app = require('../application');

var Count = Backbone.Model.extend({

	removeExpense: function (id, callback) {
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
			success: function () {
				callback();
			},
			error: function (xht) {
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

require.register("router", function(exports, require, module) {

// View list
var AllCountView = require('views/allCount/all_count_view');
var AllArchiveView = require('views/allArchives/all_archive_view');

// View screen
var CountView = require('views/count/count_view');
var MenuView = require('views/menu/menu_view');
var CountEditorView = require('views/countEditor/count_editor_view');
var ArchiveView = require('views/count/archive_view');
var NewExpense = require('views/newEvent/expense/new_expense_view');

// Models
var CountList = require('collections/count_list');
var Count = require('models/count');

var Router = Backbone.Router.extend({

	mainScreen: null,
	mainMenu: null,
	currentButton: null,

  /*
   * I Fetch all the data from the server in during the router initialization
   * because for now there is no much data and it's easy to print any page.
   *
   * The main HTML is already render server side, be remain the count list
   */
	initialize: function () {
    this.initializeCollections();

		this.mainMenu = new MenuView();
		this.mainMenu.renderCounts();

		Backbone.Router.prototype.initialize.call(this);
	},


	routes: {
		''									    	: 'mainBoard',
		'count/create'			     	: 'countEditor',
		'count/update/:id'     		: 'countEditor',
		'count/:name'				  	  : 'printCount',
    'count/:name/new-expense' : 'newExpense',
		'archive'							    : 'printAllArchive',
		'archive/:name'			    	: 'printArchive',
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
   * This view is used for count creation and count modifiation too.
   * If the count id is defined there is an udpade otherwise it's a creation
   */
	countEditor: function (countId) {
		this.selectInMenu($('#menu-add-count').parent());
		view = new CountEditorView({countId: countId});

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

		view = new CountView({countName: countName});

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

require.register("views/allArchives/all_archive_view", function(exports, require, module) {
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

require.register("views/allArchives/archive_list_view", function(exports, require, module) {
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

require.register("views/allArchives/archive_row_view", function(exports, require, module) {
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

require.register("views/allArchives/templates/all_archive", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge
/**/) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div class="panel panel-default"><div class="panel-body">');
if ( numberArchives > 0)
{
buf.push('<ul id="list-view" class="nav nav-sidebar"></ul>');
}
else
{
buf.push('<div class="page-header"><h1>No archive yet</h1><p>When you archieve some account you can find it here :)</p></div>');
}
buf.push('</div></div>');
}
return buf.join("");
};
});

require.register("views/allArchives/templates/archive_row", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge
/**/) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div class="panel panel-primary"><div class="panel-heading">' + escape((interp = model.name) == null ? '' : interp) + '</div><div class="panel-body"><label for="description">Description</label><div id="description" class="form-group"><p>' + escape((interp = model.description) == null ? '' : interp) + '</p></div><label for="user-list">Users</label><div id="user-list" class="form-group">');
// iterate model.users
;(function(){
  if ('number' == typeof model.users.length) {
    for (var $index = 0, $$l = model.users.length; $index < $$l; $index++) {
      var user = model.users[$index];

buf.push('<button');
buf.push(attrs({ 'style':("background-color: #" + (user.color) + ""), "class": ('btn') }, {"style":true}));
buf.push('>' + escape((interp = user.name) == null ? '' : interp) + '</button>');
    }
  } else {
    for (var $index in model.users) {
      var user = model.users[$index];

buf.push('<button');
buf.push(attrs({ 'style':("background-color: #" + (user.color) + ""), "class": ('btn') }, {"style":true}));
buf.push('>' + escape((interp = user.name) == null ? '' : interp) + '</button>');
   }
  }
}).call(this);

buf.push('</div><div class="form-group"><button class="archive-see-count btn btn-primary btn-block">See</button></div></div></div>');
}
return buf.join("");
};
});

require.register("views/allCount/all_count_view", function(exports, require, module) {
var BaseView = require('../../lib/base_view');
var CountListView = require('./count_list_view');

var AllCountView = BaseView.extend({
	id: 'all-count-screen',
  template: require('./templates/all_count'),

	events: {
		'click #create-new-count' : 'createNewCount',
	},


	initialize: function (attributes) {
    console.log('plop')
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

require.register("views/allCount/count_list_view", function(exports, require, module) {

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

require.register("views/allCount/count_row_view", function(exports, require, module) {
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

require.register("views/allCount/templates/all_count", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge
/**/) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div class="panel panel-default"><div class="panel-body"><ul id="list-view" class="nav nav-sidebar"><button id="create-new-count" class="btn btn-default">Create New Count</button></ul></div></div>');
}
return buf.join("");
};
});

require.register("views/allCount/templates/count_row", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge
/**/) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div class="panel panel-primary"><div class="panel-heading">' + escape((interp = model.name) == null ? '' : interp) + '</div><div class="panel-body">');
if ( model.description)
{
buf.push('<label for="description">Description</label><div id="description" class="form-group"><p>' + escape((interp = model.description) == null ? '' : interp) + '</p></div>');
}
buf.push('<label for="user-list">Users</label><div id="user-list" class="form-group">');
// iterate model.users
;(function(){
  if ('number' == typeof model.users.length) {
    for (var $index = 0, $$l = model.users.length; $index < $$l; $index++) {
      var user = model.users[$index];

buf.push('<button');
buf.push(attrs({ 'style':("background-color: #" + (user.color) + ""), "class": ('btn') }, {"style":true}));
buf.push('>' + escape((interp = user.name) == null ? '' : interp) + '</button>');
    }
  } else {
    for (var $index in model.users) {
      var user = model.users[$index];

buf.push('<button');
buf.push(attrs({ 'style':("background-color: #" + (user.color) + ""), "class": ('btn') }, {"style":true}));
buf.push('>' + escape((interp = user.name) == null ? '' : interp) + '</button>');
   }
  }
}).call(this);

buf.push('</div><div class="form-group"><button class="count-see btn btn-default btn-block">See</button><button class="count-modify btn btn-default btn-block">Modify</button><button class="count-delete btn btn-default btn-block">Delete</button></div></div></div>');
}
return buf.join("");
};
});

require.register("views/count/archive_view", function(exports, require, module) {
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

require.register("views/count/count_base_view", function(exports, require, module) {
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
    this.stats = new StatsView({count: this.count});
    this.stats.render();

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

require.register("views/count/count_view", function(exports, require, module) {
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
		'click #count-lauch-add-user'	:	'addUser',
		'click #add-new-expense'			: 'lauchNewExpense',
		'click .header-expense-elem'	: 'printTransferBody',
		'click .delete-expense-elem'	: 'deleteExpense',
		'click #header-balancing'			: 'printBalancing',
	},


  /*
   * Get the name of the class and check in the collection if he can find it
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
    // Add the user button to  userlist
		this.$('#user-list').append('<div class="row"><button class="btn" style="background-color: #'+ color +'">' + newUser + '</button></div>');

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
		var id = Number(this.$(event.target).parent().attr('id'));
		var self = this;
		this.count.removeExpense(id, function () {
			self.stats.update();
			if (self.balancing !== null && self.balancing !== undefined) {
				self.balancing.update();
			}
			self.$(event.target).parent().parent().remove();
		});
    if (this.expenses.length == 0) {
      this.$('#expense-list-view').prepend('<span id="empty-history">Your history is empty</span>');
    }
	},


});

module.exports = CountView;

});

require.register("views/count/square_view", function(exports, require, module) {
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

require.register("views/count/stats_view", function(exports, require, module) {

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
		this.$('#nb-expenses').text(this.count.get('expenses').length);
		this.$('#all-expenses').text(allExpenses);
		this.$('#perUser-expenses').text(perUserExpenses);

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

require.register("views/count/templates/count", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge
/**/) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div class="panel panel-default"><div class="panel-body"><div class="panel panel-primary"><div class="panel-heading">Users</div><div class="panel-body"><div id="stats-module"><div class="col-md-4"><div id="user-list" class="col-md-12">');
// iterate count.users
;(function(){
  if ('number' == typeof count.users.length) {
    for (var $index = 0, $$l = count.users.length; $index < $$l; $index++) {
      var user = count.users[$index];

buf.push('<div class="row"><button');
buf.push(attrs({ 'style':("background-color: #" + (user.color) + ""), "class": ('btn') }, {"style":true}));
buf.push('>' + escape((interp = user.name) == null ? '' : interp) + '</button></div>');
    }
  } else {
    for (var $index in count.users) {
      var user = count.users[$index];

buf.push('<div class="row"><button');
buf.push(attrs({ 'style':("background-color: #" + (user.color) + ""), "class": ('btn') }, {"style":true}));
buf.push('>' + escape((interp = user.name) == null ? '' : interp) + '</button></div>');
   }
  }
}).call(this);

buf.push('</div>');
if ( count.status == 'active')
{
buf.push('<div id="name-alert" class="row col-md-12"><div class="input-group"><form><input id="count-input-add-user" type="text" placeholder="My name" class="form-control"/><span class="input-group-btn"><input id="count-lauch-add-user" type="submit" value="Add user" class="btn btn-default"/></span></form></div></div>');
}
buf.push('</div><div id="canvas-block" class="col-md-4 col-xs-6"><h4>Expenses per users</h4><canvas id="chart-users" width="150" height="150"></canvas></div></div><div class="col-md-4 col-xs-6"><label for="all-expenses">All Expenses:</label><p id="all-expenses">' + escape((interp = count.allExpenses) == null ? '' : interp) + '</p><label for="nb-expenses">Number Expenses:</label><p id="nb-expenses">' + escape((interp = count.expenses.length) == null ? '' : interp) + '</p><label for="nb-expenses">Expenses per user:</label><p id="perUser-expenses">' + escape((interp = expensePerUser) == null ? '' : interp) + '</p></div>');
if ( (count.status == 'active'))
{
buf.push('<button id="add-new-expense" class="btn btn-primary btn-block">Add Event</button>');
}
buf.push('</div></div><div class="panel panel-primary"><div id="header-balancing" class="panel-heading"><span class="caret"></span><span>&nbsp;Balancing</span></div><div id="module-balancing"></div></div><div class="panel panel-primary"><div class="panel-heading">History</div><div class="panel-body"><div id="expense-list-view">');
if ( count.expenses.length == 0)
{
buf.push('<span id="empty-history">Your history is empty</span>');
}
else
{
// iterate count.expenses
;(function(){
  if ('number' == typeof count.expenses.length) {
    for (var $index = 0, $$l = count.expenses.length; $index < $$l; $index++) {
      var expense = count.expenses[$index];

buf.push('<div class="panel panel-default"><div class="panel-heading header-expense-elem"><span class="caret"></span><span> ' + escape((interp = expense.name) == null ? '' : interp) + '</span><span style="float: right">' + escape((interp = expense.amount) == null ? '' : interp) + ' ' + escape((interp = expense.currency.name) == null ? '' : interp) + '</span></div><div');
buf.push(attrs({ 'style':('display: none'), 'id':("" + (expense.id) + ""), "class": ('panel-body') }, {"style":true,"id":true}));
buf.push('><label for="seeder">Who have paid ?</label><div id="seeder"></div><button class="btn">' + escape((interp = expense.seeder) == null ? '' : interp) + '</button><div class="form-group"><label for="leecher-list">Who contribute ?</label><div id="leecher-list" class="form-group">');
// iterate expense.leecher
;(function(){
  if ('number' == typeof expense.leecher.length) {
    for (var $index = 0, $$l = expense.leecher.length; $index < $$l; $index++) {
      var leecher = expense.leecher[$index];

buf.push('<button class="btn">' + escape((interp = leecher.name) == null ? '' : interp) + '</button>');
    }
  } else {
    for (var $index in expense.leecher) {
      var leecher = expense.leecher[$index];

buf.push('<button class="btn">' + escape((interp = leecher.name) == null ? '' : interp) + '</button>');
   }
  }
}).call(this);

buf.push('</div></div><button class="btn btn-default btn-block delete-expense-elem">Delete</button></div></div>');
    }
  } else {
    for (var $index in count.expenses) {
      var expense = count.expenses[$index];

buf.push('<div class="panel panel-default"><div class="panel-heading header-expense-elem"><span class="caret"></span><span> ' + escape((interp = expense.name) == null ? '' : interp) + '</span><span style="float: right">' + escape((interp = expense.amount) == null ? '' : interp) + ' ' + escape((interp = expense.currency.name) == null ? '' : interp) + '</span></div><div');
buf.push(attrs({ 'style':('display: none'), 'id':("" + (expense.id) + ""), "class": ('panel-body') }, {"style":true,"id":true}));
buf.push('><label for="seeder">Who have paid ?</label><div id="seeder"></div><button class="btn">' + escape((interp = expense.seeder) == null ? '' : interp) + '</button><div class="form-group"><label for="leecher-list">Who contribute ?</label><div id="leecher-list" class="form-group">');
// iterate expense.leecher
;(function(){
  if ('number' == typeof expense.leecher.length) {
    for (var $index = 0, $$l = expense.leecher.length; $index < $$l; $index++) {
      var leecher = expense.leecher[$index];

buf.push('<button class="btn">' + escape((interp = leecher.name) == null ? '' : interp) + '</button>');
    }
  } else {
    for (var $index in expense.leecher) {
      var leecher = expense.leecher[$index];

buf.push('<button class="btn">' + escape((interp = leecher.name) == null ? '' : interp) + '</button>');
   }
  }
}).call(this);

buf.push('</div></div><button class="btn btn-default btn-block delete-expense-elem">Delete</button></div></div>');
   }
  }
}).call(this);

}
buf.push('</div></div></div></div></div>');
}
return buf.join("");
};
});

require.register("views/count/templates/square", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge
/**/) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div id="square-displayer" style="display: none" class="panel-body"><label for="balancing">Balancing:</label><ul id="balancing">');
// iterate users
;(function(){
  if ('number' == typeof users.length) {
    for (var $index = 0, $$l = users.length; $index < $$l; $index++) {
      var user = users[$index];

buf.push('<li><button');
buf.push(attrs({ 'style':("background-color: #" + (user.color) + ""), "class": ('btn') }, {"style":true}));
buf.push('>' + escape((interp = user.name) == null ? '' : interp) + ':</button>');
if ( user.balancing == 0)
{
buf.push('<span style="color: blue">&nbsp;ok</span>');
}
if ( user.balancing > 0)
{
buf.push('<span style="color: green">&nbsp;+' + escape((interp = user.balancing) == null ? '' : interp) + '</span>');
}
if ( user.balancing < 0)
{
buf.push('<span style="color: red">&nbsp;' + escape((interp = user.balancing) == null ? '' : interp) + '</span>');
}
buf.push('</li>');
    }
  } else {
    for (var $index in users) {
      var user = users[$index];

buf.push('<li><button');
buf.push(attrs({ 'style':("background-color: #" + (user.color) + ""), "class": ('btn') }, {"style":true}));
buf.push('>' + escape((interp = user.name) == null ? '' : interp) + ':</button>');
if ( user.balancing == 0)
{
buf.push('<span style="color: blue">&nbsp;ok</span>');
}
if ( user.balancing > 0)
{
buf.push('<span style="color: green">&nbsp;+' + escape((interp = user.balancing) == null ? '' : interp) + '</span>');
}
if ( user.balancing < 0)
{
buf.push('<span style="color: red">&nbsp;' + escape((interp = user.balancing) == null ? '' : interp) + '</span>');
}
buf.push('</li>');
   }
  }
}).call(this);

buf.push('</ul><label for="balancing">How to be square:</label><ul id="square">');
// iterate squareMoves
;(function(){
  if ('number' == typeof squareMoves.length) {
    for (var $index = 0, $$l = squareMoves.length; $index < $$l; $index++) {
      var move = squareMoves[$index];

buf.push('<li>[' + escape((interp = move.from) == null ? '' : interp) + '] gave [' + escape((interp = move.exchange) == null ? '' : interp) + '] to [' + escape((interp = move.to) == null ? '' : interp) + ']</li>');
    }
  } else {
    for (var $index in squareMoves) {
      var move = squareMoves[$index];

buf.push('<li>[' + escape((interp = move.from) == null ? '' : interp) + '] gave [' + escape((interp = move.exchange) == null ? '' : interp) + '] to [' + escape((interp = move.to) == null ? '' : interp) + ']</li>');
   }
  }
}).call(this);

buf.push('</ul><button id="archive-count" class="btn btn-primary btn-block">Close and archive</button></div>');
}
return buf.join("");
};
});

require.register("views/countEditor/count_editor_view", function(exports, require, module) {
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
	checkCountName(event) {
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

module.exports = CountEditorView;

});

require.register("views/countEditor/templates/count_editor", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge
/**/) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
if ( model)
{
buf.push('<h1>' + escape((interp = model.name) == null ? '' : interp) + '</h1><form><div class="form-group"><label for="input-name">Count Name</label><input');
buf.push(attrs({ 'id':('input-name'), 'type':('text'), 'placeholder':('Name'), 'value':("" + (model.name) + ""), "class": ('form-control') }, {"type":true,"placeholder":true,"value":true}));
buf.push('/></div><div class="form-group"><label for="input-description">Count Description</label><input');
buf.push(attrs({ 'id':('input-description'), 'type':('text'), 'placeholder':('Description'), 'value':("" + (model.description) + ""), "class": ('form-control') }, {"type":true,"placeholder":true,"value":true}));
buf.push('/></div><button id="submit-editor" class="btn btn-default">Submit</button></form>');
}
else
{
buf.push('<div class="page-header"><h1>New count</h1><small>A new count is juste a folder where you can put some friends and</small>create a fictional history of who paid what and who owe who. Each count is\ntotaly separate to other count so each user create in this one is not linked\n(yet) with the others count. If you don\'t understand just try, you will see !</div><div id="formular"><div id="input-name-grp" class="form-group"><label for="input-name">Count Name</label><input id="input-name" type="text" placeholder="Name" class="form-control"/></div><div class="form-group"><label for="input-description">Count Description</label><input id="input-description" type="text" placeholder="Description" class="form-control"/></div><label for="currency">Count Currencies</label><div id="currency" class="form-group"><button type="button" value="€" class="btn btn-default currency">€</button><button type="button" value="$" class="btn btn-default currency">$</button></div><div class="form-group"><div id="list-users" class="btn-group"></div></div><label for="input-user-grp">Count Users</label><div id="input-user-grp" class="form-group"><div class="input-group"><form><input id="input-users" type="text" placeholder="My name" class="form-control"/><span class="input-group-btn"><input id="add-user" type="submit" value="Add user" class="btn btn-default"/></span></form></div></div><div id="name-alert"></div><button id="submit-editor" class="btn btn-default">Submit</button></div>');
}
}
return buf.join("");
};
});

require.register("views/menu/count_list_view", function(exports, require, module) {

var ViewCollection = require('../../lib/view_collection');
var MenuCountRowView = require('./count_row_view');

var MenuCountListView = ViewCollection.extend({
	el: '#menu-list-count',

	itemView: MenuCountRowView,

	initialize: function (collection) {
		this.collection = collection;
		ViewCollection.prototype.initialize.call(this);
	},
});

module.exports = MenuCountListView;

});

require.register("views/menu/count_row_view", function(exports, require, module) {
var BaseView = require('../../lib/base_view');
var app = require('../../application');

var MenuCountRowView = BaseView.extend({
	template: require('./templates/count_row'),

	tagName: 'li',

	initialize: function () {
		var self = this;
		this.$el.click(function () {
			self.printCount();
		})
	},


	getRenderData: function () {
		return ({model: this.model.toJSON()});
	},


	printCount: function () {
		app.router.navigate('count/' + this.model.get('name'), {trigger: true});
	},
});

module.exports = MenuCountRowView;

});

require.register("views/menu/menu_view", function(exports, require, module) {
var BaseView = require('../../lib/base_view');
var CountListView = require('./count_list_view');
var app = require('../../application');

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

require.register("views/menu/templates/count_row", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge
/**/) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<a');
buf.push(attrs({ 'id':('count-' + (model.name) + '') }, {"id":true}));
buf.push('>' + escape((interp = model.name) == null ? '' : interp) + '</a>');
}
return buf.join("");
};
});

require.register("views/newEvent/expense/new_expense_view", function(exports, require, module) {
var BaseView = require('../../../lib/base_view');
var app = require('../../../application');


var AddExpenseView = BaseView.extend({
	template: require('./templates/new_expense'),
  id: 'new-expense',

	count: null,


	events: {
		'click .seeder'							: 'setSeeder',
		'click .leecher'						: 'setLeecher',
		'click #add-expense-save'		: 'lauchSaveExpense',
		'click #add-expense-cancel'	: 'resetNewExpense',
		'click .currency'						:	'setCurrency',
	},


	initialize: function (attributes) {
		this.count = window.countCollection.models.find(function (count) {
			if (count.get('name') == attributes.countName) {
				return true;
			}
			return false;
		});

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


	setSeeder: function (event) {
		var target = this.$(event.target).children().get(0).value;
		if (this.data.seeder === target) {
			this.data.seeder = null;
		} else {
			this.data.seeder = target;
		}
	},


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


	addUserToCount: function (newUser) {
		this.$('#seeder-list').append('<label class="btn btn-primary seeder"><input type="radio", autocomplete="off", value="'+newUser+'">' + newUser+'</label>');
		this.$('#leecher-list').append('<label class="active btn btn-primary seeder"><input type="checkbox", autocomplete="off", value="'+newUser+'">' + newUser+'</label>');
		this.data.leecher.push({name: newUser});
	},


	setCurrency: function (event) {
		this.data.currency = event.target.text;
		this.$('#choose-currency').text(this.data.currency);
	},


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


	errorMessage: function (msg) {
		this.$('#alert-zone').append('<div class="alert alert-danger" role="alert">'+msg+'</div>');
	},


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
        app.router.navigate('/count/' + this.count.get('name'), {trigger: true});
			},
		});
	},

	resetNewExpense: function () {
    app.router.navigate('/count/' + this.count.get('name'), {trigger: true});
	},
});

module.exports = AddExpenseView;

});

require.register("views/newEvent/expense/templates/new_expense", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge
/**/) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<form id="add-expense-displayer" class="form-group"><div id="alert-zone"></div><label for="input-name">Expense Name</label><input id="input-name" type="text" placeholder="Shopping..." maxlength="40" required="required" autofocus="autofocus" class="form-control"/><div class="form-group"><label for="input-description">Expense Description</label><textarea id="input-description" rows="5" class="form-control"></textarea></div><div class="form-group"><label for="input-amount">Amount</label><div class="input-group"><input id="input-amount" type="number" placeholder="42.21" aria-label="..." required="required" class="form-control"/><div class="input-group-btn"><button id="choose-currency" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" class="btn btn-default dropdown-toggle">' + escape((interp = currencies[0].name) == null ? '' : interp) + '</button><ul class="dropdown-menu dropdown-menu-right">');
// iterate currencies
;(function(){
  if ('number' == typeof currencies.length) {
    for (var $index = 0, $$l = currencies.length; $index < $$l; $index++) {
      var currency = currencies[$index];

buf.push('<li class="currency"><a>' + escape((interp = currency.name) == null ? '' : interp) + '</a></li>');
    }
  } else {
    for (var $index in currencies) {
      var currency = currencies[$index];

buf.push('<li class="currency"><a>' + escape((interp = currency.name) == null ? '' : interp) + '</a></li>');
   }
  }
}).call(this);

buf.push('</ul></div></div></div><label for="seeder-list">Who Paid ?</label><div class="form-group"><div id="seeder-list" data-toggle="buttons" class="btn-group">');
// iterate users
;(function(){
  if ('number' == typeof users.length) {
    for (var $index = 0, $$l = users.length; $index < $$l; $index++) {
      var user = users[$index];

buf.push('<label class="btn btn-primary seeder"><input type=\'radio\', autocomplete=\'off\', value="' + escape((interp = user.name) == null ? '' : interp) + '"> ' + escape((interp = user.name) == null ? '' : interp) + '</label>');
    }
  } else {
    for (var $index in users) {
      var user = users[$index];

buf.push('<label class="btn btn-primary seeder"><input type=\'radio\', autocomplete=\'off\', value="' + escape((interp = user.name) == null ? '' : interp) + '"> ' + escape((interp = user.name) == null ? '' : interp) + '</label>');
   }
  }
}).call(this);

buf.push('</div></div><label for="leecher-list">Who take Part ?</label><div class="form-group"><div id="leecher-list" data-toggle="buttons" class="btn-group">');
// iterate users
;(function(){
  if ('number' == typeof users.length) {
    for (var $index = 0, $$l = users.length; $index < $$l; $index++) {
      var user = users[$index];

buf.push('<label class="btn btn-primary leecher active"><input type=\'checkbox\', autocomplete=\'off\', value="' + escape((interp = user.name) == null ? '' : interp) + '"> ' + escape((interp = user.name) == null ? '' : interp) + '</label>');
    }
  } else {
    for (var $index in users) {
      var user = users[$index];

buf.push('<label class="btn btn-primary leecher active"><input type=\'checkbox\', autocomplete=\'off\', value="' + escape((interp = user.name) == null ? '' : interp) + '"> ' + escape((interp = user.name) == null ? '' : interp) + '</label>');
   }
  }
}).call(this);

buf.push('</div></div><div class="form-group"><button id="add-expense-save" type="submit" class="btn btn-primary btn-block">Save</button><button id="add-expense-cancel" class="btn btn-primary btn-block">Cancel</button></div></form>');
}
return buf.join("");
};
});


//# sourceMappingURL=app.js.map