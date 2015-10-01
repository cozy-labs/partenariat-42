var BaseView = require('../../lib/base_view');
var app = require('../../application');

var template = require('./templates/count');
var templateTransferUser = require('./templates/transfer_user');
var templateTransferValue = require('./templates/transfer_value');
var templateTransferContrib = require('./templates/transfer_contrib');
var templateTransferContribRow = require('./templates/transfer_contrib_row');

var CountView = BaseView.extend({
	id: 'count-screen',
	template: template,

	templateTransferUser: templateTransferUser,
	templateTransferValue: templateTransferValue,
	templateTransferContrib: templateTransferContrib,
	templateTransferContribRow: templateTransferContribRow,

	count: null,

	transfer: {
		type: null,
		users: [],
		value: 0,
	},

	events: {
		'click #count-lauch-add-user':	'addUser',
		'click .transfer-type': 'setTransferType',
		'click .transfer-user': 'setTransferUser',
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
			value: 0,
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
			this.$('#new-transfer').append('<div id="new-transfer-value"></div>');
			this.$('#new-transfer-value').html(this.templateTransferValue());

			this.$('#new-transfer').append('<div id="new-transfer-user"></div>');
			this.$('#new-transfer-user').html(this.templateTransferUser({users: this.count.get('users')}));

			this.$('#transfer-input-value')[0].addEventListener('change', (function(_this) {
				return function (event) {_this.updateContribTable(event);};
			})(this));
		}

		this.transfer.type = event.target.value;
	},


	updateContribTable: function () {
		this.transfer.value = this.$('#transfer-input-value').val();

		if (this.transfer.users.length > 0) {
			var oldContrib = this.$('#new-transfer-contrib-content');
			if (oldContrib !== null && oldContrib !== undefined) {
				oldContrib.remove();
			}

			this.$('#new-transfer-contrib-table').append('<tbody id="new-transfer-contrib-content"></tbody>');
			var self = this;
			this.transfer.users.forEach(function (user) {
				user.amount = (self.transfer.value / 100 * user.share).toFixed(2);
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
					elem.share = (elem.share - elem.share / nbUsers).toFixed(2)
					console.log('shareCollected: ', shareCollected);
				});
			}
			else {
				shareCollected = 100;
			}


			listUsers.push({name: user, share: shareCollected.toFixed(2)});

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


			console.log('user del: ', userDeleted[0])
			var shareToDistribute = (userDeleted[0].share / listUsers.length).toFixed(2);
			console.log('share 33: ', shareToDistribute);
			if (listUsers.length > 0) {
				listUsers.forEach(function (elem) {
					console.log('elem share: ', elem.share);
					console.log('shareToDestri: ', shareToDistribute)
					elem.share = (Number(elem.share) + Number(shareToDistribute)).toFixed(2);
				});
			}
		}


		console.log('users: ', listUsers);
		this.updateContribTable();
	},
});

module.exports = CountView;
