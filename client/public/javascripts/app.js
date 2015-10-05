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

		// Ideally, initialized classes should be kept in controllers & mediator.
		// If you're making big webapp, here's more sophisticated skeleton
		// https://github.com/paulmillr/brunch-with-chaplin


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

require.register("initialize", function(exports, require, module) {
var application = require('application');

$(function () {
	application.initialize();
	Backbone.history.start();
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
				self.addItem(elem, self);
		});
  },

  addItem: function (model, self) {
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


var Count = Backbone.Model.extend({
	name: null,
	description: null,
	users: [],
	history: [],
});

module.exports = Count;

});

require.register("router", function(exports, require, module) {

var HomeView = require('views/home/home_view');
var MenuView = require('views/menu/menu_view');
var CountEditorView = require('views/count-editor/count_editor_view');
var CountView = require('views/count/count_view');


var CountList = require('collections/count_list');
var Count = require('models/count');

var Router = Backbone.Router.extend({

	mainScreen: null,
	mainMenu: null,

	initialize: function () {
		if (window.countCollection == null || window.countCollection == undefined) {
			this.createCountCollection();
		}

		this.mainMenu = new MenuView();
		this.mainMenu.render();

		Backbone.Router.prototype.initialize.call(this);
	},

	routes: {
		''										: 'mainBoard',
		'count/create'				: 'countEditor',
		'count/update/:id'		: 'countEditor',
		'count/:name'					: 'printCount',
	},


	mainBoard: function () {
		view = new HomeView();

		this.displayView(view);
	},


	countEditor: function (countId) {
		view = new CountEditorView({countId: countId});

		this.displayView(view);
	},


	printCount: function (countName) {
		view = new CountView({countName: countName});

		this.displayView(view);
	},


	displayView: function (view) {
		if (this.mainView !== null && this.mainView !== undefined) {
			this.mainView.remove();
		}
		this.mainView = view;
		$('#content-screen').append(view.$el);
		view.render();
	},


	createCountCollection: function () {
		window.countCollection = new CountList();

		if (window.listCount == null || window.listCount == undefined || window.listCount == "") {
			console.log('listCount empty');
			return;
		}

		var index = 0;
		while (index < window.listCount.length) {
			var newCount = new Count(window.listCount[index]);
			window.countCollection.add(newCount);
			index++;
		}
	},
});

module.exports = Router;

});

require.register("views/count-editor/count_editor_view", function(exports, require, module) {
var BaseView = require('../../lib/base_view');
var template = require('./templates/count_editor');
var app = require('../../application');


var CountEditor = BaseView.extend({
	id: 'count-editor-screen',
	template: template,

	count: null,

	events: {
		'click #submit-editor':	'submitEditor',
	},


	initialize: function (params) {
		this.count = params.countId;
		BaseView.prototype.initialize.call(this);
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


	lauchCountCreation: function () {
		window.countCollection.create({
			name: this.$('#input-name').val(),
			description: this.$('#input-description').val(),
			users: [],
		});
		app.router.navigate('', {trigger: true});
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

});

require.register("views/count-editor/templates/count_editor", function(exports, require, module) {
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
buf.push('<h1>New Count</h1><form><div class="form-group"><label for="input-name">Count Name</label><input id="input-name" type="text" placeholder="Name" class="form-control"/></div><div class="form-group"><label for="input-description">Count Description</label><input id="input-description" type="text" placeholder="Description" class="form-control"/></div><button id="submit-editor" class="btn btn-default">Submit</button></form>');
}
}
return buf.join("");
};
});

require.register("views/count/count_view", function(exports, require, module) {
var BaseView = require('../../lib/base_view');
var app = require('../../application');

var template = require('./templates/count');
var templateHistory = require('./templates/history_elem');

var CountView = BaseView.extend({
	id: 'count-screen',
	template: template,

	templateHistory : templateHistory,

	count: null,

	transferView: null,

	events: {
		'click #count-lauch-add-user':	'addUser',
		'click .transfer-type': 'lauchNewTransfer',
		'click .header-history-elem': 'printTransferBody',
	},


	initialize: function (attributes) {
		this.count = window.countCollection.models.find(function (count) {
			if (count.get('name') == attributes.countName) {
				return true;
			}
			return null;
		});
		if (this.count == undefined || this.count == null) {
			console.error('invalide route');
		}
		BaseView.prototype.initialize.call(this);
	},


	getRenderData: function () {
		if (this.count !== null && this.count !== undefined) {
			return ({count: this.count.toJSON()});
		}
		return ({count: null});
	},


	afterRender: function () {
		var history = this.count.get('history');

		var self = this;
		history.forEach(function (transfer) {
			self.$('#history-list-view').append(self.templateHistory({transfer: transfer}));
		});
	},


	addUser: function () {
		var userList = this.count.get('users');
		var newUser = this.$('#count-input-add-user').val();

		userList.push(newUser);
		this.$('#user-list').append('<p>' + newUser + '</p>');
		if (this.transferView !== null) {
			this.transferView.addUserToCount(newUser);
		}
		this.count.save({users: userList});
		this.$('#count-input-add-user').val('');
	},


	lauchNewTransfer: function (event) {
		if (this.transferView == null) {
			this.transferView = new TransferView({count: this.count, type: event.target.value,
				users: this.count.get('users')});
			this.transferView.render();

			this.listenToOnce(this.transferView, 'remove-transfer', this.removeTransferView);

			this.listenToOnce(this.transferView, 'new-transfer', function (data) {
				$('#history-list-view').prepend(this.templateHistory({transfer: data}));
				this.removeTransferView(data.type);

			});
		}
		else {
			this.transferView.setTransferType(event.target.value);
		}
	},

	removeTransferView: function (type) {
		this.transferView.remove();
		delete this.transferView;
		this.tranferView = null;

		var targetButton = this.$('#transfer-type-'+ type);
		targetButton.removeClass('btn-info');
		targetButton.addClass('btn-default');
	},


	printTransferBody: function (event) {
		var elem =  $(event.target);
		if (elem.is('span')) {
			var historyBody =  $(event.target).parent().next('div');
		}
		else {
			var historyBody =  $(event.target).next('div');
		}
		if (historyBody.is('.printed')) {
			historyBody.slideUp('');
			historyBody.removeClass('printed');
		}
		else {
			historyBody.slideDown('slow');
			historyBody.addClass('printed');
		}
	},

});

module.exports = CountView;

});

require.register("views/count/templates/count", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge
/**/) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div class="jumbotron"><h1>' + escape((interp = count.name) == null ? '' : interp) + '</h1><p>' + escape((interp = count.description) == null ? '' : interp) + '</p></div><div class="panel panel-default"><div class="panel-heading">Users</div><div class="panel-body"><div id="user-list">');
// iterate count.users
;(function(){
  if ('number' == typeof count.users.length) {
    for (var $index = 0, $$l = count.users.length; $index < $$l; $index++) {
      var user = count.users[$index];

buf.push('<p>' + escape((interp = user) == null ? '' : interp) + '</p>');
    }
  } else {
    for (var $index in count.users) {
      var user = count.users[$index];

buf.push('<p>' + escape((interp = user) == null ? '' : interp) + '</p>');
   }
  }
}).call(this);

buf.push('</div><div class="row"><div class="col-lg-6"><div class="input-group"><input id="count-input-add-user" type="text" placeholder="My name" class="form-control"/><span class="input-group-btn"><button id="count-lauch-add-user" type="button" class="btn btn-default">Add user</button></span></div></div></div></div></div><div class="panel panel-default"><div class="panel-heading">Add a new expense</div><div class="panel-body"><label for="new-transfer">Type</label><div id="new-transfer"><div id="new-transfer-type" class="row"><div class="form-group"><button id="transfer-type-expense" type="button" value="expense" class="btn btn-default transfer-type">Expense</button><button id="transfer-type-payment" type="button" value="payment" class="btn btn-default transfer-type">Payment</button></div></div></div></div></div><div class="panel panel-default panel-heading">History<div id="history-list-view" class="panel-body"></div></div>');
}
return buf.join("");
};
});

require.register("views/count/templates/history_elem", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge
/**/) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
var history_row_mixin = function(user){
var block = this.block, attributes = this.attributes || {}, escaped = this.escaped || {};
buf.push('<tr><td>' + escape((interp = user.name) == null ? '' : interp) + '</td><td>' + escape((interp = user.share) == null ? '' : interp) + '</td><td>' + escape((interp = user.amount) == null ? '' : interp) + '</td></tr>');
};
buf.push('<div class="panel panel-default"><div class="panel-heading header-history-elem"><span> ' + escape((interp = transfer.name) == null ? '' : interp) + '</span><span style="float: right">' + escape((interp = transfer.amount) == null ? '' : interp) + '</span></div><div style="display: none" class="panel-body">');
if ( transfer.title)
{
buf.push('<h3>' + escape((interp = transfer.title) == null ? '' : interp) + '</h3>');
}
if ( transfer.description)
{
buf.push('<p>' + escape((interp = transfer.description) == null ? '' : interp) + '</p>');
}
if ( transfer.date)
{
buf.push('<p>Date: ' + escape((interp = transfer.date) == null ? '' : interp) + '</p>');
}
buf.push('<table class="table"><thead><tr><th>Name</th><th>%</th><th>Amount</th></tr></thead><tbody>');
// iterate transfer.users
;(function(){
  if ('number' == typeof transfer.users.length) {
    for (var $index = 0, $$l = transfer.users.length; $index < $$l; $index++) {
      var user = transfer.users[$index];

history_row_mixin(user);
    }
  } else {
    for (var $index in transfer.users) {
      var user = transfer.users[$index];

history_row_mixin(user);
   }
  }
}).call(this);

buf.push('</tbody></table></div></div>');
}
return buf.join("");
};
});

require.register("views/count/transfer/templates/transfer", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge
/**/) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div id="new-transfer-module"><label for="new-transfer-amount">Name</label><div id="new-transfer-name"><input id="transfer-input-name" type="text" placeholder="Shopping..." class="form-contrl"/></div><label for="new-transfer-amount">Description</label><div id="new-transfer-description"><input id="transfer-input-description" type="text" class="form-contrl"/></div><label for="new-transfer-amount">amount</label><div id="new-transfer-amount" class="row"><div class="col-lg-6"><div class="input-group"><input id="transfer-input-amount" type="number" placeholder="42.21" aria-label="..." class="form-control"/><span class="input-group-btn"><button id="transfer-choose-device" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" class="btn btn-default dropdown-toggle">€<div class="caret"></div></button><ul class="dropdown-menu dropdown-menu-right"><li><a>€</a></li></ul></span></div></div></div><label for="new-transfer-user">Users</label><div id="new-transfer-user" class="row"><div id="new-transfer-user-content" class="form-group">');
// iterate users
;(function(){
  if ('number' == typeof users.length) {
    for (var $index = 0, $$l = users.length; $index < $$l; $index++) {
      var user = users[$index];

buf.push('<button');
buf.push(attrs({ 'type':('button'), 'value':('' + (user) + ''), "class": ('btn') + ' ' + ('btn-default') + ' ' + ('transfer-user') }, {"type":true,"value":true}));
buf.push('>' + escape((interp = user) == null ? '' : interp) + '</button>');
    }
  } else {
    for (var $index in users) {
      var user = users[$index];

buf.push('<button');
buf.push(attrs({ 'type':('button'), 'value':('' + (user) + ''), "class": ('btn') + ' ' + ('btn-default') + ' ' + ('transfer-user') }, {"type":true,"value":true}));
buf.push('>' + escape((interp = user) == null ? '' : interp) + '</button>');
   }
  }
}).call(this);

buf.push('</div></div></div><div id="new-transfer-btn" class="row"><button id="transfer-cancel" class="btn btn-default">Cancel</button></div>');
}
return buf.join("");
};
});

require.register("views/count/transfer/templates/transfer_contrib", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge
/**/) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div id="new-transfer-contrib-section"><table id="new-transfer-contrib-table" class="table"><thead><tr><th>Name</th><th>%</th><th>Amount</th></tr></thead></table></div>');
}
return buf.join("");
};
});

require.register("views/count/transfer/templates/transfer_contrib_row", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge
/**/) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<tr><td>' + escape((interp = user.name) == null ? '' : interp) + '</td><td>' + escape((interp = user.share) == null ? '' : interp) + '</td><td>' + escape((interp = user.amount) == null ? '' : interp) + '</td></tr>');
}
return buf.join("");
};
});

require.register("views/count/transfer/transfer_view", function(exports, require, module) {
var BaseView = require('../../../lib/base_view');
var app = require('../../../application');

var template = require('./templates/transfer');

var templateTransferContrib = require('./templates/transfer_contrib');
var templateTransferContribRow = require('./templates/transfer_contrib_row');


var TransferView = BaseView.extend({
	template: template,


	templateTransferContrib: templateTransferContrib,
	templateTransferContribRow: templateTransferContribRow,


	count: null,
	users: null,



	events: {
		'click .transfer-user': 'setTransferUser',
		'click #transfer-send': 'sendTransfer',
		'click #transfer-cancel': 'resetNewTransfer',
	},

	initialize: function (attributes) {
		this.count = attributes.count;
		this.users = attributes.users;
		this.data = {
			type: null,
			users: [],
			amount: 0,
		};
		this.setTransferType(attributes.type);

		BaseView.prototype.initialize.call(this);
	},


	render: function () {
			$('#new-transfer').append(this.$el);
			this.$el.html(this.template({users: this.users}));

			this.$('#transfer-input-amount')[0].addEventListener('change', (function(_this) {
				return function (event) {_this.updateContribTable(event);};
			})(this));

			this.$('#transfer-input-name')[0].addEventListener('change', (function(_this) {
				return function (event) {_this.data.name = event.target.value;};
			})(this));

			this.$('#transfer-input-description')[0].addEventListener('change', (function(_this) {
				return function (event) {_this.data.description = event.target.value;};
			})(this));
	},


	setTransferType: function (type) {
		if (type == this.data.type) {
			return;
		}

		var expenseButton = $('#transfer-type-expense');
		var paymentButton = $('#transfer-type-payment');

		if (type == 'payment') {
			paymentButton.removeClass('btn-default');
			paymentButton.addClass('btn-info');

			expenseButton.removeClass('btn-info');
			expenseButton.addClass('btn-default');
		}
		else if (type == 'expense') {
			paymentButton.removeClass('btn-info');
			paymentButton.addClass('btn-default');

			expenseButton.removeClass('btn-default');
			expenseButton.addClass('btn-info');
		}
		else {
			console.error('Bad transfer type');
			return;
		}
		this.data.type = type;
	},


	updateContribTable: function () {
		this.data.amount = this.$('#transfer-input-amount').val();

		if (this.data.users.length > 0) {
			var oldContrib = this.$('#new-transfer-contrib-content');
			if (oldContrib !== null && oldContrib !== undefined) {
				oldContrib.remove();
			}

			this.$('#new-transfer-contrib-table').append('<tbody id="new-transfer-contrib-content"></tbody>');
			var self = this;
			this.data.users.forEach(function (user) {
				user.amount = +(Math.round(self.data.amount / 100 * user.share * 100) / 100).toFixed(2);
				user.share = +(Math.round(user.share * 100) / 100).toFixed(2);
					self.$('#new-transfer-contrib-content').append(
							self.templateTransferContribRow({user: user}));
			});
		}
	},


	addUserToTransfer: function (event) {
		var userName = event.target.value;
		var listUsers = this.data.users;
		var targetButton = this.$(event.target);

		if (listUsers.length == 0) {
			this.$('#new-transfer-module').append(this.templateTransferContrib());
			this.$('#new-transfer-btn').append('<button id="transfer-send" class="btn btn-default"> Save</button>');
		}

		var nbUsers = listUsers.length + 1;
		var shareCollected = 0;

		if (listUsers.length > 0) {
			listUsers.forEach(function (elem) {
				shareCollected += elem.share / nbUsers;
				elem.share = elem.share - elem.share / nbUsers;
			});
		}
		else {
			shareCollected = 100;
		}

		listUsers.push({name: userName, share: shareCollected});

		targetButton.removeClass('btn-default');
		targetButton.addClass('btn-info');
	},


	removeUserFromTransfer: function (event) {
		var userName = event.target.value;
		var listUsers = this.data.users;
		var targetButton = this.$(event.target);
		var userDeleted;

		{
			var index = 0;
			while (index < listUsers.length) {
				if (listUsers[index].name == userName) {
					break;
				}
				index++;
			}
			userDeleted = listUsers.splice(index, 1);
		}

		if (listUsers.length == 0) {
			this.$('#new-transfer-contrib-section').remove();
			this.$('#transfer-send').remove();
		}

		targetButton.removeClass('btn-info');
		targetButton.addClass('btn-default');


		if (listUsers.length > 0) {
			var shareToDistribute = userDeleted[0].share / listUsers.length;

			listUsers.forEach(function (elem) {
				elem.share = Number(elem.share) + Number(shareToDistribute);
			});
		}
	},


	setTransferUser: function (event) {
		var find = this.data.users.find(function (element) {
			if (element.name == event.target.value) {
				return element;
			}
			return null;
		});

		if (find == undefined) {
			this.addUserToTransfer(event);
		}
		else {
			this.removeUserFromTransfer(event);
			}

		this.updateContribTable();
	},


	addUserToCount: function (newUser) {
			this.$('#new-transfer-user-content').append('<button type="button" value="'+ newUser +
					'" class="btn btn-default transfer-user">' + newUser + '</button>');
	},


	sendTransfer: function () {
		if (this.data.amount != 0) {
			var countHistory = this.count.get('history');
			countHistory.unshift(this.data);
			this.count.save({history: countHistory});
			this.trigger('new-transfer', this.data);
		}
	},

	resetNewTransfer: function () {
		this.trigger('remove-transfer', this.data.type);
	}
});

module.exports = TransferView;

});

require.register("views/home/count_list_view", function(exports, require, module) {

var ViewCollection = require('../../lib/view_collection');
var HomeCountRowView = require('./count_row_view');

var HomeCountListView = ViewCollection.extend({
	el: '#home-list-count',

	itemView: HomeCountRowView,

	initialize: function (collection) {
		this.collection = collection;
		ViewCollection.prototype.initialize.call(this);
	},
});

module.exports = HomeCountListView;

});

require.register("views/home/count_row_view", function(exports, require, module) {
var BaseView = require('../../lib/base_view');
var template = require('./templates/count_row');

var app = require('../../application');

var HomeCountRowView = BaseView.extend({
	template: template,

	events: {
		'click .home-delete-count' : 'deleteCount',
		'click .home-modify-count' : 'modifyCount',
	},

	getRenderData: function () {
		return ({model: this.model.toJSON()});
	},

	deleteCount: function () {
		window.countCollection.remove(this);
		this.model.destroy();
	},

	modifyCount: function () {
		app.router.navigate('count/update/' + this.model.id, {trigger: true});
	},

});

module.exports = HomeCountRowView;

});

require.register("views/home/home_view", function(exports, require, module) {
var BaseView = require('../../lib/base_view');
var CountListView = require('./count_list_view');


var template = require('./templates/home');
var app = require('../../application');

var HomeView = BaseView.extend({
	id: 'home-screen',
  template: template,

	events: {
		'click #create-new-count' : 'createNewCount',
	},


	afterRender: function () {
		this.countCollectionView = new CountListView(window.countCollection);
		this.countCollectionView.render();
	},


	createNewCount: function () {
		app.router.navigate('count/create', {trigger: true});
	},

});

module.exports = HomeView;

});

require.register("views/home/templates/count_row", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge
/**/) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div class="panel panel-default"><div class="panel-heading">' + escape((interp = model.name) == null ? '' : interp) + '</div><div class="panel-body"><h4>Description</h4><p>' + escape((interp = model.description) == null ? '' : interp) + '</p>');
if ( model.users.length > 0)
{
buf.push('<h4>Users</h4>');
// iterate model.users
;(function(){
  if ('number' == typeof model.users.length) {
    for (var $index = 0, $$l = model.users.length; $index < $$l; $index++) {
      var user = model.users[$index];

buf.push('<p>' + escape((interp = user) == null ? '' : interp) + '</p>');
    }
  } else {
    for (var $index in model.users) {
      var user = model.users[$index];

buf.push('<p>' + escape((interp = user) == null ? '' : interp) + '</p>');
   }
  }
}).call(this);

}
buf.push('<button class="home-delete-count btn btn-default">Supprimer</button><button class="home-modify-count btn btn-default">Modifier</button></div></div>');
}
return buf.join("");
};
});

require.register("views/home/templates/home", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge
/**/) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div id="list-all-count"><label for="home-list">All Count</label><ul id="home-list-count" class="nav nav-sidebar"></ul></div><button id="create-new-count" class="btn btn-default">Create New Count</button>');
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
var template = require('./templates/count_row');
var app = require('../../application');

var MenuCountRowView = BaseView.extend({
	template: template,

	className: 'menu-count-row',
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
var template = require('./templates/menu');
var app = require('../../application');

var MenuView = BaseView.extend({
	el: '#menu-screen',
	className: 'sidebar',

	template: template,

	events: {
		'click #menu-all-count'		: 'goHomeView',
		'click #menu-add-count'		: 'createNewCount',
	},

	afterRender: function () {
		this.countCollectionView = new CountListView(window.countCollection);
		this.countCollectionView.render();
	},


	goHomeView: function () {
		app.router.navigate('', {trigger: true});
	},


	createNewCount: function () {
		app.router.navigate('count/create', {trigger: true});
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
buf.push('<a>' + escape((interp = model.name) == null ? '' : interp) + '</a>');
}
return buf.join("");
};
});

require.register("views/menu/templates/menu", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge
/**/) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<label for="menu-section">Count</label><ul class="nav nav-sidebar"><li><a id="menu-all-count">All Count</a></li></ul><ul id="menu-list-count" class="nav nav-sidebar"></ul><ul class="nav nav-sidebar"><li><a id="menu-add-count">Create a Count</a></li></ul>');
}
return buf.join("");
};
});


//# sourceMappingURL=app.js.map