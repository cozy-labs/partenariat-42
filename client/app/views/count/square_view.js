var BaseView = require('../../lib/base_view');
var app = require('../../application');


var SquareView = BaseView.extend({
	id: 'square-view',
	template: require('./templates/square'),


	initialize: function (attributes) {
		this.count = attributes.count;

		this.setUsersBalancing();

		BaseView.prototype.initialize.call(this);
	},


	render: function () {
		$('#module-balancing').prepend(this.$el);
		this.$el.html(this.template({users: this.usersBalancing, squareMoves: this.squareMoves}));
		this.$('#square-displayer').slideDown('slow');

	},


	clickDisplayer: function () {
		var displayer = this.$('#square-displayer');

		if (displayer.is('.printed')) {
			displayer.slideUp('slow');
			displayer.removeClass('printed');
		} else {
			displayer.slideDown('slow');
			displayer.addClass('printed');
		}
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

		this.setSquareMoves();

	},

	setSquareMoves: function () {
		this.squareMoves = [];

		var tmpUsers = JSON.parse(JSON.stringify(this.usersBalancing));

		var i = 0;

		console.log('tmpUsers: ', tmpUsers);
		while (tmpUsers.length > 1 && i++ < 100) {
			var leecher = null;
			var indexLeecher = 0;

			for (index in tmpUsers) {
				console.log('leecher: ', tmpUsers[index]);
				if (leecher === null || (leecher.balancing > tmpUsers[index].balancing && leecher != tmpUsers[index])) {
					leecher = tmpUsers[index];
					console.log('best leecher: ', leecher.balancing);
					indexLeecher = index;
				}
			}

			var seeder = null;
			var indexSeeder = 0;

			for (index in tmpUsers) {
				console.log('seeder: ', tmpUsers[index]);
				if (seeder === null || (seeder.balancing < tmpUsers[index].balancing && seeder != tmpUsers[index])) {
					seeder = tmpUsers[index];
					console.log('best seeder: ', seeder.balancing);
					indexSeeder = index;
				}
			}

			var exchange = 0;
			console.log('before leecher: ', leecher);
			console.log('before seeder: ', seeder);
			if (leecher.balancing * -1 > seeder.balancing) {
				exchange = seeder.balancing;
			} else {
				exchange = - leecher.balancing;
			}

			seeder.balancing -= exchange;
			leecher.balancing += exchange

			this.squareMoves.push({
				from: leecher.name,
				to: seeder.name,
				exchange: exchange
			});
			console.log('after leecher: ', leecher);
			console.log('after seeder: ', seeder);

			if (leecher.balancing == 0) {
				tmpUsers.splice(indexLeecher, 1);
			}
			if (seeder.balancing == 0) {
				tmpUsers.splice(indexSeeder, 1);
			}

			console.log('exchange: ', exchange);
			console.log('tmpUsers: ', tmpUsers)

			console.log('$$$$$$$$$$$$$$$$$$$$$$')
		}
	},


	resetSquare: function () {
		this.trigger('remove-module');
	},
});

module.exports = SquareView;
