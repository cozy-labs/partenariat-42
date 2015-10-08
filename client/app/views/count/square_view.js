var BaseView = require('../../lib/base_view');
var app = require('../../application');


var SquareView = BaseView.extend({
	id: 'square-view',
	template: require('./templates/square'),

	events: {
		'click #square-cancel': 'resetSquare',

	},

	render: function () {
		$('#module').prepend(this.$el);
		this.$el.html(this.template());
		this.$('#new-transfer-displayer').slideDown('slow');

	},

	resetSquare: function () {
		this.trigger('remove-module');
	},
});

module.exports = SquareView;
