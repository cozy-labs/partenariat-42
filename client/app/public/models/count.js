
var app = require('../application');

var Count = Backbone.Model.extend({

  removeExpense: function (id) {
    var newExpenses = this.get('expenses'),
      currentExpenses = this.get('allExpenses'),
      index = null,
      expenseRemove = null,
      leecherList = null,
      seeder = null,
      newUsersList = null,
      newAllExpenses = null;


    index = this.get('expenses').findIndex(function (elem) {
      if (elem.id === id) {
        return true;
      }
      return false;
    });

    expenseRemove = newExpenses.splice(index, 1)[0];

    leecherList = expenseRemove.leecher;
    seeder = expenseRemove.seeder;

    newUsersList = this.get('users').map(function (user) {
      leecherList.every(function (expenseUser) {
        if (user.name === expenseUser.name) {
          var leechPerUser = (Math.round(Number(expenseRemove.amount) /
                Number(expenseRemove.leecher.length) * 100) / 100).toFixed(2);
          user.leech = (Math.round((Number(user.leech) - leechPerUser) * 100) /
              100).toFixed(2);
          return false;
        }
        return true;
      });

      if (user.name === seeder) {
        user.seed = (Math.round((Number(user.seed) -
                Number(expenseRemove.amount)) * 100) / 100).toFixed(2);
      }
      return user;
    });

    newAllExpenses = (Math.round((Number(currentExpenses) -
            Number(expenseRemove.amount)) * 100) / 100).toFixed(2);

    this.save({
      expenses: newExpenses,
      allExpenses: newAllExpenses,
      users: newUsersList
    }, {
      url: '/public/count/' + this.id,
      wait: true,
      error: function (xhr) {
        console.error(xhr);
      }
    });
  },


});

module.exports = Count;
