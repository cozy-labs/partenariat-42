var ViewCollection = require('../../lib/view_collection');
var template = require('./templates/user_list');
var User = require('../../models/user');

var HomeUserListView = ViewCollection.extend({
	el: '#home-user-list',
	template: template,

	collectionEl: '#home-user-list-content',
	itemView: User,

});

module.exports = HomeUserListView;
