var CountBaseView = require('../countBase/count_base_view');
var app = require('../../application');

var AddExpenseView = require('./add_expense/add_expense_view');

var colorSet = require('../../helper/color_set');



var CountView = CountBaseView.extend({
	id: 'count-screen',
	template: require('./templates/count'),

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


	initialize: function (attributes) {
		this.count = window.countCollection.models.find(function (count) {
			if (count.get('name') == attributes.countName) {
				return true;
			}
			return false;
		});

		CountBaseView.prototype.initialize.call(this);
	},


	addUser: function () {
		var userList = this.count.get('users');
		var newUser = this.$('#count-input-add-user').val();
		var color = colorSet[userList.length % colorSet.length];

		this.$('#alert-name').remove();
		var nameIsTaken = userList.find(function (elem) {
			if (elem.name === newUser) {
				return true;
			}
			return false;
		});

		if (nameIsTaken !== undefined) {
			this.$('#name-alert').append('<div id="alert-name" class="alert alert-danger" role="alert"><a href="#" class="close" data-dismiss="alert">&times;</a>Name already taken</div>');
			return;
		}

		userList.push({name: newUser, seed: 0, leech: 0, color: color});
		this.$('#user-list').append('<div class="row"><button class="btn" style="background-color: #'+ color +'">' + newUser + '</button></div>');

		if (this.newExpense !== null) {
			this.newExpense.addUserToCount(newUser);
		}
		this.count.save({users: userList});
		this.$('#count-input-add-user').val('');
		if (this.balancing !== null && this.balancing !== undefined) {
			this.balancing.update();
		}
	},


	lauchNewExpense: function (event) {
		if (this.newExpense == null) {
			this.newExpense = new AddExpenseView({count: this.count});
		}

		this.$('#add-new-expense').remove();
		this.newExpense.render();

		this.listenToOnce(this.newExpense, 'remove-new-expense', this.removeNewExpense);

		this.listenToOnce(this.newExpense, 'add-new-expense', function (data) {
			this.$('#expense-list-view').prepend(this.templateExpense({expense: data}));
			this.stats.update();
			if (this.balancing !== null && this.balancing !== undefined) {
				this.balancing.update();
			}
			this.removeNewExpense();
		});
	},


	removeNewExpense: function () {
		this.newExpense.remove();
		delete this.newExpense
			this.newExpense= null;

		this.$('#module').prepend('<button id="add-new-expense" class="btn btn-default btn-block"> Add a new expense</button>');
	},


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
	},


});

module.exports = CountView;
