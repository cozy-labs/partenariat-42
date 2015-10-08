var BaseView = require('../../lib/base_view');
var app = require('../../application');


var SquareView = BaseView.extend({
	id: 'square-view',
	template: require('./templates/square'),


	events: {
		'click #square-cancel': 'resetSquare',
	},


	initialize: function (attributes) {
		this.count = attributes.count;

		this.setUsersBalancing();

		BaseView.prototype.initialize.call(this);
	},


	render: function () {
		$('#module').prepend(this.$el);
		this.$el.html(this.template({users: this.usersBalancing}));
		this.$('#square-displayer').slideDown('slow');

	},


	setUsersBalancing: function () {
		var allExpenses = this.count.get('allExpenses');
		var users = this.count.get('users');

		var expensePerUser = (Math.round(allExpenses / users.length * 100) / 100).toFixed(2);

		this.usersBalancing = users.map(function (user) {
			return {
				name: user.name,
				color: user.color,
				balancing: user.expenses - expensePerUser,
			}
		});

		//this.squareMove = users.map()

		console.log('userBalancing: ', this.usersBalancing);
	},


	resetSquare: function () {
		this.trigger('remove-module');
	},
});

module.exports = SquareView;
