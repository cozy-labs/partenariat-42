
var BaseView = require('../../lib/base_view');
var template = require('./templates/stats');


var StatsView = BaseView.extend({
	template: template,
	el: '#stats-module',


	initialize: function (attributes) {
		this.count = attributes.count;

		BaseView.prototype.initialize.call(this);
	},


	getRenderData: function () {
		return {count: this.count.toJSON()};
	},


	afterRender: function () {
		var chartCtx = this.$('#chart-users').get(0).getContext("2d");

		var data = this.computeDataCount();
		this.pieChart = new Chart(chartCtx).Pie(data);
	},


	computeDataCount: function () {
		return this.count.get('users').map(function (elem) {
			return {value: elem.expenses, color: '#'+elem.color, label: elem.name}
		});
	},


	update: function () {
		this.$('#nb-expenses').text(this.count.get('expenses').length);
		this.$('#all-expenses').text(this.count.get('allExpenses'));

		var self = this;
		this.count.get('users').forEach(function (elem, index) {
			if (index < self.pieChart.segments.length) {
				self.pieChart.segments[index].value = elem.expenses;
				self.pieChart.update();
			}
			else {
				self.pieChart.addData({
					value: elem.expenses,
					color: elem.color,
					label: elem.name
				});
			}
		});
	},

});

module.exports = StatsView;
