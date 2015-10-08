var BaseView = require('../../lib/base_view');
var app = require('../../application');

var TransferView = require('./transfer/transfer_view');
var StatsView = require('./stats_view');
var SquareView = require('./square_view');


var colorSet = require('../../helper/color_set');

var CountView = BaseView.extend({
	id: 'count-screen',
	template: require('./templates/count'),

	templateExpense : require('./templates/expense_elem'),
	templateActionBtn: require('./templates/action_btn'),

	count: null,
	dataResume: {
		allExpense: 0,
	},

	transferView: null,

	events: {
		'click #count-lauch-add-user'	:	'addUser',
		'click #add-new-transfer'			: 'lauchNewExpense',
		'click #header-balancing'			: 'printBalancing',
		'click .header-expense-elem'	: 'printTransferBody',
		'click .delete-expense-elem'	: 'deleteExpense',
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
		var color = colorSet[userList.length % colorSet.length];

		userList.push({name: newUser, expenses: 0, color: color});
		this.$('#user-list').append('<div><button class="btn" style="background-color: #'+ color +'">' + newUser + '</button></div>');

		if (this.transferView !== null) {
			this.transferView.addUserToCount(newUser);
		}
		this.count.save({users: userList});
		this.$('#count-input-add-user').val('');
	},


	lauchNewExpense: function (event) {
		if (this.module == null) {
			this.module = new TransferView({
				count: this.count,
				users: this.count.get('users'),
				pieChart: this.pieChart
			});
		}
		this.renderModule();


		this.listenToOnce(this.module, 'new-transfer', function (data) {
			this.$('#expense-list-view').prepend(this.templateExpense({transfer: data}));
			this.stats.update();
			this.removeModule();
		});
	},


	renderModule: function () {
		this.$('#add-new-transfer').remove();
		this.$('#square-count').remove();

		this.module.render();

		this.listenToOnce(this.module, 'remove-module', this.removeModule);
	},


	removeModule: function () {
		this.module.remove();
		delete this.module
		this.module = null;

		this.$('#module').prepend(this.templateActionBtn());
	},


	printBalancing: function () {
		if (this.balancing === null || this.balancing === undefined) {
			this.balancing = new SquareView({count: this.count});
			this.balancing.render();
		}
		this.balancing.clickDisplayer()
	},


	printTransferBody: function (event) {
		var elem =  $(event.target);
		if (elem.is('span')) {
			var expenseBody =  $(event.target).parent().next('div');
		} else {
			var expenseBody =  $(event.target).next('div');
		}

		if (expenseBody.is('.printed')) {
			expenseBody.slideUp('');
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
			self.$(event.target).parent().parent().remove();
		});
	},


});

module.exports = CountView;
