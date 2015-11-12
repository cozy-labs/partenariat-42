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

    this.setUsersBalance();

    BaseView.prototype.initialize.call(this);
  },


  render: function () {
    $('#module-balancing').prepend(this.$el);
    this.$el.html(this.template({users: this.usersBalance, squareMoves: this.squareMoves}));
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
   * Update and rerender the balance
   * TODO: make a manual update to changing directly the values not a
   * remove/rerender because that trigger a slide up/slide down and it's visible
   */
  update: function () {
    this.setUsersBalance();
    this.setSquareMoves();
    this.remove();
    this.render();
  },


  /*
   * Create an array with the name, color and balance of each user
   */
  setUsersBalance: function () {
    var allExpenses = this.count.get('allExpenses');
    var users = this.count.get('users');

    this.usersBalance = users.map(function (user) {
      return {
        name: user.name,
        color: user.color,
        balance: (Math.round((user.seed - user.leech) * 100) / 100).toFixed(2)
      }
    });

    this.setSquareMoves();
  },


  /*
   * Calcule each moves to balance the count
   */
  setSquareMoves: function () {
    this.squareMoves = [];

    // copy the userBalance array
    var tmpUsers = [].concat(this.usersBalance);

    var i = 0;

    /*
     * The main loop: in each loop we find the biggest leecher and the biggest
     * seeder and we equalize between their. If one of them is balanced I remove it.
     *
     * Repeat the loop while it stays 1 or less user. If one user stay it's
     * a "lost", I can't redistribute to any user. The goal it's to make this
     * lost as small as possible. For now it's max "0.01 * (nb or user -1)"
     */
    while (tmpUsers.length > 1 && i++ < 50) {
      var leecher = null;
      var indexLeecher = 0;

      // Find the biggest leecher
      for (index in tmpUsers) {
        if (leecher === null || (leecher.balance > tmpUsers[index].balance && leecher != tmpUsers[index])) {
          leecher = {
            name: tmpUsers[index].name,
            balance: Number(tmpUsers[index].balance)
          }
          indexLeecher = index;
        }
      }

      var seeder = null;
      var indexSeeder = 0;

      // Find the biggest seeder
      for (index in tmpUsers) {
        if (seeder === null || (seeder.balance < tmpUsers[index].balance && seeder != tmpUsers[index])) {
          seeder = {
            name: tmpUsers[index].name,
            balance: Number(tmpUsers[index].balance)
          }
          indexSeeder = index;
        }
      }

      // Set the amount I can send from the leecher to the seeder to equalize a
      // max
      if (leecher.balance * -1 > seeder.balance) {
        exchange = seeder.balance;
      } else {
        exchange = - leecher.balance;
      }

      // Set the new balancin
      seeder.balance = (Math.round((seeder.balance - exchange) * 100) / 100).toFixed(2);
      leecher.balance = (Math.round((leecher.balance + exchange) * 100) / 100).toFixed(2);

      // Add the exchange to the list of exchanges
      if (exchange !== 0 && exchange !== 'NaN') {
        this.squareMoves.push({
          from: leecher.name,
          to: seeder.name,
          exchange: exchange
        });
      }

      // Remove the leecher of the seeder if their balance is equal to 0
      if (leecher.balance == 0) {
        tmpUsers.splice(indexLeecher, 1);
      }
      if (seeder.balance == 0) {
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
