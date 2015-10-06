var BaseView = require('../../lib/base_view');
var app = require('../../application');

var TransferView = require('./transfer/transfer_view');
var StatsView = require('./stats_view');

var setColor = require('../../helper/color_set');


var CountView = BaseView.extend({
	id: 'count-screen',
	template: require('./templates/count'),

	templateExpense : require('./templates/expense_elem'),

	count: null,
	dataResume: {
		allExpense: 0,
	},

	transferView: null,

	events: {
		'click #count-lauch-add-user':	'addUser',
		'click #add-new-transfer': 'lauchNewTransfer',
		'click .header-expense-elem': 'printTransferBody',
		'click .delete-expense-elem': 'deleteExpenseElem',
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
		var expense = this.count.get('expenses');
		var self = this;

		expense.forEach(function (transfer) {
			self.$('#expense-list-view').append(self.templateExpense({transfer: transfer}));
		});

		this.stats = new StatsView({count: this.count});
		this.stats.render();

	},


	addUser: function () {
		var userList = this.count.get('users');
		var newUser = this.$('#count-input-add-user').val();
		var color = setColor[userList.length % setColor.length];

		userList.push({name: newUser, expenses: 0, color: color});
		this.$('#user-list').append('<div><button class="btn" style="background-color: #'+ color +'">' + newUser + '</button></div>');
		if (this.transferView !== null) {
			this.transferView.addUserToCount(newUser);
		}
		this.count.save({users: userList});
		this.$('#count-input-add-user').val('');
	},


	lauchNewTransfer: function (event) {
		if (this.transferView == null) {
			this.transferView = new TransferView({
				count: this.count,
				users: this.count.get('users'),
				pieChart: this.pieChart
			});
			this.transferView.render();

			this.listenToOnce(this.transferView, 'remove-transfer', this.removeTransferView);

			this.listenToOnce(this.transferView, 'new-transfer', function (data) {
				this.$('#expense-list-view').prepend(this.templateExpense({transfer: data}));
				this.stats.update();
				this.removeTransferView();

			});
		}
		else {
			this.transferView.setTransferType(event.target.value);
		}
	},

	removeTransferView: function () {
		this.transferView.remove();
		delete this.transferView;
		this.tranferView = null;

		this.$('#new-transfer-module').prepend('<button id="add-new-transfer" class="btn btn-default btn-block">Add a new expense</button>')
	},


	printTransferBody: function (event) {
		var elem =  $(event.target);
		if (elem.is('span')) {
			var expenseBody =  $(event.target).parent().next('div');
		}
		else {
			var expenseBody =  $(event.target).next('div');
		}
		if (expenseBody.is('.printed')) {
			expenseBody.slideUp('');
			expenseBody.removeClass('printed');
		}
		else {
			expenseBody.slideDown('slow');
			expenseBody.addClass('printed');
		}
	},

	deleteExpenseElem: function (event) {
		this.count.removeExpense(Number(this.$(event.target).parent().attr('id')));
		this.$(event.target).parent().parent().remove();
		this.stats.update();
	},


});

module.exports = CountView;
