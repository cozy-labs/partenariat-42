var BaseView = require('../../lib/base_view');

var app = require('../../application');

var CountRowView = BaseView.extend({
	template: require('./templates/count_row'),

	events: {
		'click .count-delete' : 'deleteCount',
		'click .count-modify' : 'modifyCount',
		'click .count-see'		: 'seeCount',
	},

	getRenderData: function () {
		return ({model: this.model.toJSON()});
	},

	deleteCount: function () {
		window.countCollection.remove(this);
		this.model.destroy();
		if (window.countCollection.length === 0) {
			app.router.navigate('count/create', {trigger: true});
		}
	},


	modifyCount: function () {
		app.router.navigate('count/update/' + this.model.id, {trigger: true});
	},


	seeCount: function () {
		app.router.navigate('count/' + this.model.get('name'), {trigger: true});
	}

});

module.exports = CountRowView;
