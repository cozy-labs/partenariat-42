var BaseView = require('../../lib/base_view');
var app = require('../../application');

var template = require('./templates/count');
var templateHistory = require('./templates/history_elem');

var TransferView = require('./transfer/transfer_view');

var CountView = BaseView.extend({
	id: 'count-screen',
	template: template,

	templateHistory : templateHistory,

	count: null,

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
		console.log('plop')
		if (this.transferView == null) {
			this.transferView = new TransferView({count: this.count, users: this.count.get('users')});
			this.transferView.render();

			this.listenToOnce(this.transferView, 'remove-transfer', this.removeTransferView);

			this.listenToOnce(this.transferView, 'new-transfer', function (data) {
				this.$('#history-list-view').prepend(this.templateHistory({transfer: data}));
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
