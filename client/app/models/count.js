

var Count = Backbone.Model.extend({

	removeExpense: function (id) {
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

		console.log('expenxe remove 1: ', expenseRemove);
		var users = expenseRemove[0].users
		for (index in users) {

			currentUsers.every(function (elem) {
				if (elem.name === users[index].name) {
					elem.expenses -= users[index].amount;
					return false;
				}
				return true;
			});
		}

		console.log('current expense: ', currentExpenses);
		console.log('final expenxe remove: ', expenseRemove[0].amount);
		this.save({
			expenses: newExpenses,
			allExpenses: Number(currentExpenses - expenseRemove[0].amount)
		});
	},
});

module.exports = Count;
