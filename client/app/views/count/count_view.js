var BaseView = require('../../lib/base_view');
var app = require('../../application');

var template = require('./templates/count');
var templateTransferUser = require('./templates/transfer_user');
var templateTransferamount = require('./templates/transfer_amount');
var templateTransferContrib = require('./templates/transfer_contrib');
var templateTransferContribRow = require('./templates/transfer_contrib_row');

var CountView = BaseView.extend({
	id: 'count-screen',
	template: template,

	templateTransferUser: templateTransferUser,
	templateTransferamount: templateTransferamount,
	templateTransferContrib: templateTransferContrib,
	templateTransferContribRow: templateTransferContribRow,

	count: null,

	transfer: {
		type: null,
		users: [],
		amount: 0,
	},

	events: {
		'click #count-lauch-add-user':	'addUser',
		'click .transfer-type': 'setTransferType',
		'click .transfer-user': 'setTransferUser',
		'click #transfer-send': 'sendTransfer',
	},


	initialize: function (attributes) {
		this.count = window.countCollection.get(attributes.countId);
		BaseView.prototype.initialize.call(this);
	},


	getRenderData: function () {
		if (this.count !== null && this.count !== undefined) {
			return ({count: this.count.toJSON()});
		}
		return ({count: null});
	},

	afterRender: function () {
		this.transfer = {
			type: null,
			users: [],
			amount: 0,
		}
	},


	addUser: function () {
		var userList = this.count.get('users');
		var newUser = this.$('#count-input-add-user').val();

		userList.push(newUser);
		this.$('#user-list').append('<p>' + newUser + '</p>');
		if (this.transfer.type !== null) {
			this.$('#new-transfer-user-content').append('<button type="button" value="'+ newUser +'" class="btn btn-default transfer-user">' + newUser + '</button>');
		}
		this.count.save({users: userList});
		this.$('#count-input-add-user').val('');
	},


	setTransferType: function (event) {
		this.$('#transfer-type-expense').removeClass('btn-default btn-info');
		this.$('#transfer-type-payment').removeClass('btn-default btn-info');
		this.$(event.target).addClass('btn-info');

		if (this.transfer.type == null) {
			this.$('#new-transfer').append('<div id="new-transfer-amount"></div>');
			this.$('#new-transfer-amount').html(this.templateTransferamount());

			this.$('#new-transfer').append('<div id="new-transfer-user"></div>');
			this.$('#new-transfer-user').html(this.templateTransferUser({users: this.count.get('users')}));

			this.$('#transfer-input-amount')[0].addEventListener('change', (function(_this) {
				return function (event) {_this.updateContribTable(event);};
			})(this));
		}

		this.transfer.type = event.target.value;
	},


	updateContribTable: function () {
		this.transfer.amount = this.$('#transfer-input-amount').val();

		if (this.transfer.users.length > 0) {
			var oldContrib = this.$('#new-transfer-contrib-content');
			if (oldContrib !== null && oldContrib !== undefined) {
				oldContrib.remove();
			}

			this.$('#new-transfer-contrib-table').append('<tbody id="new-transfer-contrib-content"></tbody>');
			var self = this;
			this.transfer.users.forEach(function (user) {
				user.amount = +(Math.round(self.transfer.amount / 100 * user.share * 100) / 100).toFixed(2);
				user.share = +(Math.round(user.share * 100) / 100).toFixed(2);
					self.$('#new-transfer-contrib-content').append(self.templateTransferContribRow({user: user}));
			});
		}
	},


	setTransferUser: function (event) {
		var user = event.target.value;
		var listUsers = this.transfer.users;

		var find = listUsers.find(function (element) {
			if (element.name == user) {
				return element;
			}
			return null;
		});

		var elem = this.$(event.target);

		if (find == undefined) {
			if (listUsers.length == 0) {
				this.$('#new-transfer').append('<div id="new-transfer-contrib"></div>');
				this.$('#new-transfer-contrib').html(this.templateTransferContrib());
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

			listUsers.push({name: user, share: shareCollected});

			elem.removeClass('btn-default');
			elem.addClass('btn-info');
		}
		else {

			var index = 0;
			while (index < listUsers.length) {
				if (listUsers[index].name == user) {
					break;
				}
				index++;
			}

			var userDeleted = listUsers.splice(index, 1);
			if (listUsers.length == 0) {
				this.$('#new-transfer-contrib').remove()
			}

			elem.removeClass('btn-info');
			elem.addClass('btn-default');


			var shareToDistribute = userDeleted[0].share / listUsers.length;
			if (listUsers.length > 0) {
				listUsers.forEach(function (elem) {
					elem.share = Number(elem.share) + Number(shareToDistribute);
				});
			}
		}


		this.updateContribTable();
	},


	sendTransfer: function () {
		if (this.transfer.amount != 0) {
			console.log('plop');
			var countHistory = this.count.get('history');
			countHistory.unshift(this.transfer);
			this.count.save({history: countHistory});
			this.resetNewTransfer();
		}
	},

	resetNewTransfer: function () {
		this.$('#new-transfer-amount').remove();
		this.$('#new-transfer-user').remove();
		this.$('#new-transfer-contrib-table').remove();

		this.$('#transfer-input-amount').val('');

		this.$('#transfer-type-expense').removeClass('btn-info');
		this.$('#transfer-type-expense').addClass('btn-default');

		this.$('#transfer-type-payment').removeClass('btn-info');
		this.$('#transfer-type-payment').addClass('btn-default');

		this.transfer = {
			type: null,
			users: [],
			amount: 0,
		}
	}
});

module.exports = CountView;
