var BaseView = require('../../lib/base_view');
var app = require('../../application');


var SquareView = BaseView.extend({
	id: 'square-view',
	template: require('./templates/square'),


	events: {
		'click #archive-count': 'archive',
	},


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


	update: function () {
		this.setUsersBalancing();
		this.setSquareMoves();
		this.remove();
		this.render();
	},


	setUsersBalancing: function () {
		var allExpenses = this.count.get('allExpenses');
		var users = this.count.get('users');

		this.usersBalancing = users.map(function (user) {
			return {
				name: user.name,
				color: user.color,
				balancing: (Math.round((user.seed - user.leech) * 100) / 100).toFixed(2)
			}
		});

		this.setSquareMoves();
	},


	setSquareMoves: function () {
		this.squareMoves = [];

		var tmpUsers = JSON.parse(JSON.stringify(this.usersBalancing));

		var i = 0;

		while (tmpUsers.length > 1 && i++ < 50) {
			var leecher = null;
			var indexLeecher = 0;

			for (index in tmpUsers) {
				if (leecher === null || (leecher.balancing > tmpUsers[index].balancing && leecher != tmpUsers[index])) {
					leecher = {
						name: tmpUsers[index].name,
						balancing: Number(tmpUsers[index].balancing)
					}
					indexLeecher = index;
				}
			}

			var seeder = null;
			var indexSeeder = 0;

			for (index in tmpUsers) {
				if (seeder === null || (seeder.balancing < tmpUsers[index].balancing && seeder != tmpUsers[index])) {
					seeder = {
						name: tmpUsers[index].name,
						balancing: Number(tmpUsers[index].balancing)
					}
					indexSeeder = index;
				}
			}

			if (leecher.balancing * -1 > seeder.balancing) {
				exchange = seeder.balancing;
			} else {
				exchange = - leecher.balancing;
			}

			seeder.balancing = (Math.round((seeder.balancing - exchange) * 100) / 100).toFixed(2);
			leecher.balancing = (Math.round((leecher.balancing + exchange) * 100) / 100).toFixed(2);

			if (exchange !== 0 && exchange !== 'NaN') {
				this.squareMoves.push({
					from: leecher.name,
					to: seeder.name,
					exchange: exchange
				});
			}

			if (leecher.balancing == 0) {
				tmpUsers.splice(indexLeecher, 1);
			}
			if (seeder.balancing == 0) {
				tmpUsers.splice(indexSeeder, 1);
			}
		}
	},


	archive: function (event) {
		console.log('plop');
	},


	resetSquare: function () {
		this.trigger('remove-module');
	},
});

module.exports = SquareView;
