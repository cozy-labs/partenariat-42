

var Count = Backbone.Model.extend({

	removeExpense: function (id, callback) {
		console.log('id: ', id)
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
					user.leech = (Math.round((Number(user.leech) - Number(expenseRemove.amount)) * 100) / 100).toFixed(2);
					return false;
				}
				return true;
			});

			console.log('user: ', user.name);
			console.log('seeder: ', seeder.name)
			if (user.name == seeder.name) {
				console.log('seeder')
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
			error: function (xht) {
				console.error(xhr);
			}
		});
	},
});

module.exports = Count;
