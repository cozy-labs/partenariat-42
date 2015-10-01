var BaseView = require('../../lib/base_view');
var template = require('./templates/count');
var app = require('../../application');


var CountView = BaseView.extend({
	id: 'count-screen',
	template: template,

	count: null,

	events: {
		'click #count-lauch-add-user':	'addUser',
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
		this.count.save({users: userList});
	}

});

module.exports = CountView;
