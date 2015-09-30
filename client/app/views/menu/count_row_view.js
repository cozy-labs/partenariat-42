var BaseView = require('../../lib/base_view');
var template = require('./templates/count_row');


var MenuCountRowView = BaseView.extend({
	template: template,

	getRenderData: function () {
		return ({model: this.model.toJSON()});
	},

});

module.exports = MenuCountRowView;
