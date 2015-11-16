/*jslint plusplus: true*/
var BaseView = require('../../lib/base_view');
var app = require('../../application');

/*
 * Manage the balancing module.
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
    this.$el.html(this.template({users: this.usersBalance,
      squareMoves: this.squareMoves}));
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
    this.usersBalance = this.count.get('users').map(function (user) {
      return {
        name: user.name,
        color: user.color,
        balance: (Math.round((user.seed - user.leech) * 100) / 100)
      };
    });

    this.setSquareMoves();
  },


  /*
   * Compute each moves to balance the count
   */
  setSquareMoves: function () {
    this.squareMoves = [];

    // copy the userBalance array
    var tmpUsers = [].concat(this.usersBalance),
      i = 0,
      leecher = null,
      indexLeecher = 0,
      index = 0,
      seeder = null,
      indexSeeder = 0,
      roundNumber = null,
      exchange = null;

    roundNumber = function (input) {
      var number = null;

      if (input instanceof Number) {
        number = input;
      } else {
        number = Number(input);
      }
      return (Math.round(number * 100) / 100);
    };

    /*
     * The main loop: in each loop it find the biggest leecher and the biggest
     * seeder and we equalize between them. If one of them is balanced, that
     * remove it.
     *
     * Repeat the loop while it stays 1 or less user. If one user stay it's
     * a "lost" and we can't redistribute to any user. The goal it's to make
     * this lost as small as possible. For now it's max "0.01 * (nb or user -1)"
     */

    while (tmpUsers.length > 1 && i++ < 50) {
      leecher = null;
      indexLeecher = 0;

      // Find the biggest leecher
      for (index = 0; index < tmpUsers.length; index++) {
        if (leecher === null || (leecher.balance > tmpUsers[index].balance &&
              leecher !== tmpUsers[index])) {
          leecher = {
            name: tmpUsers[index].name,
            balance: Number(tmpUsers[index].balance)
          };
          indexLeecher = index;
        }
      }


      // Find the biggest seeder
      for (index = 0; index < tmpUsers.length; index++) {
        if (seeder === null || (seeder.balance < tmpUsers[index].balance &&
              seeder !== tmpUsers[index])) {
          seeder = {
            name: tmpUsers[index].name,
            balance: Number(tmpUsers[index].balance)
          };
          indexSeeder = index;
        }
      }

      // Compute the max amount available in the leecher and seeder.
      if (leecher.balance * -1 > seeder.balance) {
        exchange = seeder.balance;
      } else {
        exchange = -leecher.balance;
      }


      // Set the new balance
      seeder.balance = roundNumber(seeder.balance - exchange);
      leecher.balance = roundNumber(leecher.balance + exchange);

      // Add the exchange to the list of exchanges
      if (exchange !== 0 && exchange !== 'NaN') {
        this.squareMoves.push({
          from: leecher.name,
          to: seeder.name,
          exchange: exchange
        });
      }

      // Remove the leecher of the seeder if their balance is equal to 0
      if (leecher.balance === 0) {
        tmpUsers.splice(indexLeecher, 1);
      }
      if (seeder.balance === 0) {
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
