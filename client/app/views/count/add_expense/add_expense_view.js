var BaseView = require('../../../lib/base_view');
var app = require('../../../application');


var AddExpenseView = BaseView.extend({
	template: require('./templates/add_expense'),

	count: null,


	events: {
		'click .seeder'							: 'setSeeder',
		'click .leecher'						: 'setLeecher',
		'click #add-expense-save'		: 'lauchSaveExpense',
		'click #add-expense-cancel'	: 'resetNewExpense',
	},

	initialize: function (attributes) {
		this.count = attributes.count;
		var leecher = this.count.get('users').map(function (elem) {
			return {name: elem.name};
		});
		this.data = {
			leecher: leecher,
		};

		BaseView.prototype.initialize.call(this);
	},


	render: function () {
		$('#module').prepend(this.$el);
		this.$el.html(this.template({users: this.count.get('users')}));
		this.$('#add-expense-displayer').slideDown('slow');

		this.$('#input-amount')[0].addEventListener('change', (function(_this) {
			return function (event) {_this.data.amount = event.target.value;};
		})(this));

		this.$('#input-name')[0].addEventListener('change', (function(_this) {
			return function (event) {_this.data.name = event.target.value;};
		})(this));

		this.$('#input-description')[0].addEventListener('change', (function(_this) {
			return function (event) {_this.data.description = event.target.value;};
		})(this));
	},


	setSeeder: function (event) {
		var seederTarget = this.$(event.target);
		var oldSeederTarget = null;
		var self = this;

		if (this.data.seeder !== null && this.data.seeder !== undefined) {
			var seederList = this.$('.seeder');

			for (var index = 0; index < seederList.length; index++) {
				var elem = seederList[index];

				if (seederList[index].value === self.data.seeder) {
					oldSeederTarget = seederList[index];
				}
			};

			oldSeederTarget = this.$(oldSeederTarget);
			oldSeederTarget.removeClass('btn-info');
			oldSeederTarget.addClass('btn-default');
		}

		seederTarget.removeClass('btn-default');
		seederTarget.addClass('btn-info');
		this.data.seeder = event.target.value;
	},


	setLeecher: function (event) {
		var listLeecher = this.data.leecher;
		var targetButton = this.$(event.target);
		var leecherIndex = null;;

		listLeecher.find(function (element, index) {
			if (element.name == event.target.value) {
				leecherIndex = index;
				return true;
			}
			return false;
		});

		console.log('index: ', leecherIndex);
		if (leecherIndex === null) {
			listLeecher.push({name: event.target.value});

			targetButton.removeClass('btn-default');
			targetButton.addClass('btn-info');
		}
		else {
			listLeecher.splice(leecherIndex, 1);

			targetButton.removeClass('btn-info');
			targetButton.addClass('btn-default');
		}
		console.log('leechers: ', this.data.leecher);
	},


	addUserToCount: function (newUser) {
		this.$('#add-transfer-user-content').append('<button type="button" value="'+ newUser +
				'" class="btn btn-default transfer-user">' + newUser + '</button>');
	},


	lauchSaveExpense: function () {
		var data = this.data;
		var error = false;

		this.$('#alert-zone').remove();
		this.$('#add-expense-displayer').prepend('<div id="alert-zone"></div>');
		if (data.name === null || data.name == undefined) {
			this.errorMessage('Your expense need a name');
			error = true;
		}
		if (data.seeder === null || data.seeder == undefined) {
			this.errorMessage('One person must paid');
			error = true;
		}
		if (data.amount == undefined) {
			this.errorMessage('You haven\'t set a amount');
			error = true;
		} else if (data.amount <= 0) {
			this.errorMessage('The amount must be positive');
			error = true;
		}
		if (data.leecher.length === 0) {
			this.errorMessage('You must choose almost one persone who get benefice');
			error = true;
		}
		if (error === false) {
			this.sendNewExpense();
		}
	},


	errorMessage: function (msg) {
		console.log('error')
		this.$('#alert-zone').append('<div class="alert alert-danger" role="alert">'+msg+'</div>');
	},


	sendNewExpense: function () {
		console.log('data: ', this.data)
		var self = this;
		var newExpensesList = this.count.get('expenses');
		newExpensesList.push(this.data);

		this.data.id = Date.now() + Math.round(Math.random() % 100);

		var allUsers = this.count.get('users');
		allUsers.every(function (user) {
			if (self.data.seeder === user.name) {
				user.seed = self.data.amount;
				return false;
			}
			return true;
		});

		var leechPerUser = (Math.round(this.data.amount / this.data.leecher.length * 100) / 100).toFixed(2);
		console.log('leecherPerUser: ', leechPerUser);
		this.data.leecher.forEach(function (elem) {
			allUsers.every(function (user) {
				if (elem.name === user.name) {
					user.leech += leechPerUser;
					return false;
				}
				return true;
			});
		});

		var newAllExpenses = (Math.round((Number(this.count.get('allExpenses')) + this.data.amount) * 100) / 100).toFixed(2);
		console.log('allUsers: ', allUsers);
		this.count.save({
			allExpenses: newAllExpenses,
			expenses: newExpensesList,
			users: allUsers,
		}, {
			wait: true,
			success: function (data) {
				self.trigger('add-transfer', self.data);
			},
			error: function (xhr) {
				console.error(xht);
				self.trigger('remove-transfer');
			}
		});
	},

	resetNewExpense: function () {
		this.trigger('remove-new-expense');
	},

	remove: function () {
		this.$el.slideUp('slow');
		BaseView.prototype.remove.call(this);
	}
});

module.exports = AddExpenseView;
