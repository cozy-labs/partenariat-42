var BaseView = require('../../lib/base_view');
var app = require('../../application');

/*
 * Specific view Wiche manage the balancing module.
 *
 * TODO: Separate with a model
 */
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


  /*
   * Print or remove the body of the balancing module
   */
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


  /*
   * Update and rerender the balancing
   * TODO: make a manual update to changing directly the values not a
   * remove/rerender because that trigger a slide up/slide down and it's visible
   */
	update: function () {
		this.setUsersBalancing();
		this.setSquareMoves();
		this.remove();
		this.render();
	},


  /*
   * Create an array with the name, color and balancing of each user
   */
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


  /*
   * Calcule each moves to balancing the count
   */
	setSquareMoves: function () {
		this.squareMoves = [];

    // copy the userBalancing array
		var tmpUsers = JSON.parse(JSON.stringify(this.usersBalancing));

		var i = 0;

    /*
     * The main loop: in each loop we find the biggest leecher and the biggest
     * seeder and we equalise between their. If one of them have is balancing to
     * 0 I remove it.
     *
     * Repeate the loop while it stay 1 or less user. If one user stay it's the
     * a "lost", I can't redistribute to any user. The goal it's to make this
     * lost tinier possible. For now it's max "0.01 * (nb or user -1)"
     */
		while (tmpUsers.length > 1 && i++ < 50) {
			var leecher = null;
			var indexLeecher = 0;

      // Find the biggest leecher
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

      // Find the biggest seeder
			for (index in tmpUsers) {
				if (seeder === null || (seeder.balancing < tmpUsers[index].balancing && seeder != tmpUsers[index])) {
					seeder = {
						name: tmpUsers[index].name,
						balancing: Number(tmpUsers[index].balancing)
					}
					indexSeeder = index;
				}
			}

      // Set the amount I can send from the leecher to the seeder to equalize a
      // max
			if (leecher.balancing * -1 > seeder.balancing) {
				exchange = seeder.balancing;
			} else {
				exchange = - leecher.balancing;
			}

      // Set the new balancin
			seeder.balancing = (Math.round((seeder.balancing - exchange) * 100) / 100).toFixed(2);
			leecher.balancing = (Math.round((leecher.balancing + exchange) * 100) / 100).toFixed(2);

      // Add the exchange to the list of exchanges
			if (exchange !== 0 && exchange !== 'NaN') {
				this.squareMoves.push({
					from: leecher.name,
					to: seeder.name,
					exchange: exchange
				});
			}

      // Remove the leecher of the seeder if their balancing is equal to 0
			if (leecher.balancing == 0) {
				tmpUsers.splice(indexLeecher, 1);
			}
			if (seeder.balancing == 0) {
				tmpUsers.splice(indexSeeder, 1);
			}
		}
	},


  /*
   * Archive a count
   */
	archive: function (event) {
		this.count.archive();
	},


	resetSquare: function () {
		this.trigger('remove-module');
	},
});

module.exports = SquareView;
