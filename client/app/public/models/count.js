
var app = require('../application');

var Count = Backbone.Model.extend({
	url: 'count',

	removeExpense: function (id, callback) {
		var index = this.get('expenses').findIndex(function (elem) {
			if (elem.id === id) {
				return true;
			}
			return false;
		});

		var newExpenses = this.get('expenses');
		var expenseRemove = newExpenses.splice(index, 1)[0];

		var currentExpenses = this.get('allExpenses');
		var currentUsers = this.get('users');
		var leecherList = expenseRemove.leecher;
		var seeder = expenseRemove.seeder;

		var newUsersList = this.get('users').map(function (user) {
			leecherList.every(function (expenseUser) {
				if (user.name === expenseUser.name) {
					var leechPerUser = (Math.round(Number(expenseRemove.amount) / Number(expenseRemove.leecher.length) * 100) / 100).toFixed(2);
					user.leech = (Math.round((Number(user.leech) - leechPerUser) * 100) / 100).toFixed(2);
					return false;
				}
				return true;
			});

			if (user.name == seeder) {
					user.seed = (Math.round((Number(user.seed) - Number(expenseRemove.amount)) * 100) / 100).toFixed(2);
			}
			return user;
		});

		var newAllExpenses = (Math.round((Number(currentExpenses) - Number(expenseRemove.amount)) * 100) / 100).toFixed(2);

		this.save({
			expenses: newExpenses,
			allExpenses: newAllExpenses,
			users: newUsersList
		}, {
			wait: true,
			success: function () {
				callback();
			},
			error: function (xhr) {
				console.error(xhr);
			}
		});
	},


});

module.exports = Count;
