var BaseView = require('../../lib/base_view');
var template = require('./templates/home');
var app = require('../../application');

var HomeView = BaseView.extend({
	id: 'home-screen',
  template: template,

	events: {
		'click #create-new-count' : 'createNewCount'
	},

	getRenderData: function () {
		if (window.listCount) {
			return (window.listCount.toJSON());
		}
	},


	createNewCount: function () {
		app.router.navigate('count/create', {trigger: true});
	}

});

module.exports = HomeView;
