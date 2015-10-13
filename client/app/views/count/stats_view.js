
var BaseView = require('../../lib/base_view');
var template = require('./templates/stats');

var colorSet = require('../../helper/color_set');

var StatsView = BaseView.extend({
	template: template,
	el: '#stats-module',


	initialize: function (attributes) {
		this.count = attributes.count;

		BaseView.prototype.initialize.call(this);
	},


	getRenderData: function () {
		var expensePerUser = +(Math.round(this.count.get('allExpenses') / this.count.get('users').length * 100) / 100).toFixed(2);

		return {
			count: this.count.toJSON(),
			colorSet: colorSet,
			expensePerUser: expensePerUser
		};
	},


	afterRender: function () {
		var chartCtx = this.$('#chart-users').get(0).getContext("2d");

		var data = this.computeDataCount();
		this.pieChart = new Chart(chartCtx).Pie(data);
	},


	computeDataCount: function () {
		return this.count.get('users').map(function (elem) {
			return {value: elem.seed, color: '#'+elem.color, label: elem.name}
		});
	},


	update: function () {
		var allExpenses = Number(this.count.get('allExpenses'));
		var nbUsers = Number(this.count.get('users').length);

		var perUserExpenses = +(Math.round(allExpenses / nbUsers * 100) / 100).toFixed(2);

		this.$('#nb-expenses').text(this.count.get('expenses').length);
		this.$('#all-expenses').text(allExpenses);
		this.$('#perUser-expenses').text(perUserExpenses);

		var self = this;
		this.count.get('users').forEach(function (elem, index) {
			if (index < self.pieChart.segments.length) {
				self.pieChart.segments[index].value = elem.seed;
				self.pieChart.update();
			}
			else {
				self.pieChart.addData({
					value: elem.expenses,
					color: '#' + elem.color,
					label: elem.name
				});
			}
		});
	},

});

module.exports = StatsView;
