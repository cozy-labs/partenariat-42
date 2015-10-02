var BaseView = require('../../lib/base_view');
var app = require('../../application');

var template = require('./templates/count');
var TransferView = require('./transfer/transfer_view');

var CountView = BaseView.extend({
	id: 'count-screen',
	template: template,

	count: null,

	transferView: null,

	events: {
		'click #count-lauch-add-user':	'addUser',
		'click .transfer-type': 'lauchNewTransfer',
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

			this.listenToOnce(this.transferView, 'remove', function (type) {
				this.transferView.remove();
				delete this.transferView;
				this.tranferView = null;

				var targetButton = this.$('#transfer-type-'+ type);
				targetButton.removeClass('btn-info');
				targetButton.addClass('btn-default');
			});
		}
		else {
			this.transferView.setTransferType(event.target.value);
		}
	},

});

module.exports = CountView;
