var BaseView = require('../../../lib/base_view');
var app = require('../../../application');


var AddExpenseView = BaseView.extend({
	template: require('./templates/new_expense'),
  id: 'new-expense',

	count: null,


	events: {
		'click .seeder'							: 'setSeeder',
		'click .leecher'						: 'setLeecher',
		'click #add-expense-save'		: 'lauchSaveExpense',
		'click #add-expense-cancel'	: 'resetNewExpense',
		'click .currency'						:	'setCurrency',
	},


	initialize: function (attributes) {
		this.count = window.countCollection.models.find(function (count) {
			if (count.get('name') == attributes.countName) {
				return true;
			}
			return false;
		});

		if (this.count == undefined || this.count == null) {
			console.error('invalide route');
      app.router.navigate('', {trigger: true});
		}

		var leecher = this.count.get('users').map(function (elem) {
			return {name: elem.name};
		});

		this.data = {
			leecher: leecher,
			currency: this.count.get('currencies')[0],
		};

		BaseView.prototype.initialize.call(this);
	},


  getRenderData: function () {
    return {
      currencies: this.count.get('currencies'),
      users: this.count.get('users'),
    };
  },

  afterRender: function () {
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
		var target = this.$(event.target).children().get(0).value;
		if (this.data.seeder === target) {
			this.data.seeder = null;
		} else {
			this.data.seeder = target;
		}
	},


	setLeecher: function (event) {
		var target = this.$(event.target).children().get(0).value;
		var listLeecher = this.data.leecher;
		var leecherIndex = null;;

		listLeecher.find(function (element, index) {
			if (element.name == target) {
				leecherIndex = index;
				return true;
			}
			return false;
		});

		if (leecherIndex === null) {
			listLeecher.push({name: target});
		}
		else {
			listLeecher.splice(leecherIndex, 1);
		}
	},


	addUserToCount: function (newUser) {
		this.$('#seeder-list').append('<label class="btn btn-primary seeder"><input type="radio", autocomplete="off", value="'+newUser+'">' + newUser+'</label>');
		this.$('#leecher-list').append('<label class="active btn btn-primary seeder"><input type="checkbox", autocomplete="off", value="'+newUser+'">' + newUser+'</label>');
		this.data.leecher.push({name: newUser});
	},


	setCurrency: function (event) {
		this.data.currency = event.target.text;
		this.$('#choose-currency').text(this.data.currency);
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
		this.$('#alert-zone').append('<div class="alert alert-danger" role="alert">'+msg+'</div>');
	},


	sendNewExpense: function () {
		var self = this;
		var newExpensesList = this.count.get('expenses');
		newExpensesList.push(this.data);

		this.data.id = Date.now() + Math.round(Math.random() % 100);

		var allUsers = this.count.get('users');
		allUsers.every(function (user) {
			if (self.data.seeder === user.name) {
				user.seed = (Math.round((Number(self.data.amount) + Number(user.seed)) * 100) / 100).toFixed(2);
				return false;
			}
			return true;
		});

		var leechPerUser = (Math.round(Number(this.data.amount) / Number(this.data.leecher.length) * 100) / 100).toFixed(2);
		this.data.leecher.forEach(function (elem) {
			allUsers.every(function (user) {
				if (elem.name === user.name) {
					user.leech = +(Math.round((Number(leechPerUser) + Number(user.leech)) * 100) / 100).toFixed(2);
					return false;
				}
				return true;
			});
		});

		var newAllExpenses = (Math.round((Number(this.count.get('allExpenses')) + Number(this.data.amount)) * 100) / 100).toFixed(2);
		this.count.save({
			allExpenses: newAllExpenses,
			expenses: newExpensesList,
			users: allUsers,
		}, {
			wait: true,
			success: function (data) {
        app.router.navigate('/count/' + this.count.get('name'), {trigger: true});
			},
		});
	},

	resetNewExpense: function () {
    app.router.navigate('/count/' + this.count.get('name'), {trigger: true});
	},
});

module.exports = AddExpenseView;
