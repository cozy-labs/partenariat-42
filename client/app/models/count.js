

var Count = Backbone.Model.extend({

	removeExpense: function (id, callback) {
		var index = this.get('expenses').findIndex(function (elem) {
			if (elem.id === id) {
				return true;
			}
			return false;
		});

		var newExpenses = this.get('expenses');
		var expenseRemove = newExpenses.splice(index, 1);

		var currentExpenses = this.get('allExpenses');
		var currentUsers = this.get('users');
		var usersInExpense = expenseRemove[0].users

		var newUsersList = this.get('users').map(function (elem) {
			usersInExpense.every(function (user) {
				if (elem.name === user.name) {
					elem.expenses = (Math.round((Number(elem.expenses) - Number(user.amount)) * 100) / 100).toFixed(2);
					return false;
				}
				return true;
			});
			return elem;
		});

		var newAllExpenses = (Math.round((Number(currentExpenses) - Number(expenseRemove[0].amount)) * 100) / 100).toFixed(2);

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
