var BaseView = require('../../lib/base_view');
var app = require('../../application');

var StatsView = require('./stats_view');
var SquareView = require('./square_view');


var CountBaseView = BaseView.extend({
  template: require('./templates/count'),

	initialize: function () {
		if (this.count == undefined || this.count == null) {
			console.error('invalide route');
      app.router.navigate('', {trigger: true});
		}

		BaseView.prototype.initialize.call(this);
	},


	getRenderData: function () {
		if (this.count !== null && this.count !== undefined) {
      var expensePerUser = +(Math.round(this.count.get('allExpenses') /
            this.count.get('users').length * 100) / 100).toFixed(2);

			return ({
        count: this.count.toJSON(),
        expensePerUser: expensePerUser
      });
		}
	},


	afterRender: function () {
    //var expenseList = this.count.get('expenses');
    //var self = this;

    //if (expenseList.length == 0) {
      //this.$('#expense-list-view').prepend('<span id="empty-history">Your history is empty</span>');
    //} else {
      //expenseList.forEach(function (expense) {
        //self.$('#expense-list-view').prepend(self.templateExpense({expense: expense}));
      //});
    //}

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
