var BaseView = require('../../lib/base_view');
var app = require('../../application');

var StatsView = require('./stats_view');
var SquareView = require('./square_view');


var CountBaseView = BaseView.extend({
	templateExpense : require('./templates/expense_elem'),

	initialize: function () {
		if (this.count == undefined || this.count == null) {
			console.error('invalide route');
		}

		BaseView.prototype.initialize.call(this);
	},


	getRenderData: function () {
		if (this.count !== null && this.count !== undefined) {
			return ({count: this.count.toJSON()});
		}
		return ({count: null});
	},


	render: function () {
		BaseView.prototype.render.call(this);

		var expenseList = this.count.get('expenses');
		var self = this;

		expenseList.forEach(function (expense) {
			self.$('#expense-list-view').prepend(self.templateExpense({expense: expense}));
		});

		this.stats = new StatsView({count: this.count});
		this.stats.render();

	},


	printBalancing: function () {
		if (this.balancing === null || this.balancing === undefined) {
			this.balancing = new SquareView({count: this.count});
			this.balancing.render();
		}
		this.balancing.clickDisplayer()
	},
});

module.exports = CountBaseView;
