var BaseView = require('../../lib/base_view');
var app = require('../../application');

var template = require('./templates/count');
var templateHistory = require('./templates/history_elem');

var TransferView = require('./transfer/transfer_view');
var setColor = require('../../helper/color_set');


var CountView = BaseView.extend({
	id: 'count-screen',
	template: template,

	templateHistory : templateHistory,

	count: null,
	dataResume: {
		allExpense: 0,
	},

	transferView: null,

	events: {
		'click #count-lauch-add-user':	'addUser',
		'click #add-new-transfer': 'lauchNewTransfer',
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

		var chartCtx = this.$('#chart-users').get(0).getContext("2d");
		var data = this.count.get('users').map(function (elem) {
			return {value: elem.expenses, color: '#'+elem.color, label: elem.name}
		});
		this.pieChart = new Chart(chartCtx).Pie(data);
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
				this.$('#history-list-view').prepend(this.templateHistory({transfer: data}));
				this.$('#nb-expenses').text(this.count.get('history').length);
				this.$('#all-expenses').text(this.count.get('allExpenses'));
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
