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
				var userAmount = +(Math.round(self.data.amount / 100 * user.share * 100) / 100).toFixed(2);
				user.share = +(Math.round(user.share * 100) / 100).toFixed(2);
					self.$('#new-transfer-contrib-content').append(
							self.templateTransferContribRow({user: user, userAmount: userAmount}));
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
			this.resetNewTransfer();
		}
	},

	resetNewTransfer: function () {
		this.trigger('remove', this.data.type);
	}
});

module.exports = TransferView;
