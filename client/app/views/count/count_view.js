var BaseView = require('../../lib/base_view');
var app = require('../../application');

var template = require('./templates/count');
var templateHistory = require('./templates/history_elem');
var TransferView = require('./transfer/transfer_view');

var CountView = BaseView.extend({
	id: 'count-screen',
	template: template,

	templateHistory: templateHistory,

	count: null,

	transferView: null,

	events: {
		'click #count-lauch-add-user':	'addUser',
		'click .transfer-type': 'lauchNewTransfer',
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

});

module.exports = CountView;
