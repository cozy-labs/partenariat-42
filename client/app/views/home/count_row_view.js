var BaseView = require('../../lib/base_view');
var template = require('./templates/count_row');


var HomeCountRowView = BaseView.extend({
	template: template,

	events: {
		'click .home-delete-count' : 'deleteCount',
	},

	getRenderData: function () {
		return ({model: this.model.toJSON()});
	},

	deleteCount: function () {
		window.countCollection.remove(this);
		this.model.destroy();
	},

});

module.exports = HomeCountRowView;
