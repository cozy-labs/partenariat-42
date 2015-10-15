
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

		this.count.get('users').forEach(function (user, indexUser) {
			var indexPie = null;
			self.pieChart.segments.find(function (pieSegment, index) {
				if (pieSegment.label === user.name) {
					indexPie = index;
					return true;
				}
				return false;
			})
			if (indexPie !== undefined && indexPie !== null) {
				if (user.seed == 0) {
					self.pieChart.removeData(indexPie);
				} else {
					self.pieChart.segments[indexPie].value = user.seed;
					self.pieChart.update();
				}
			} else {
				self.pieChart.addData({
					value: user.seed,
					color: '#' + user.color,
					label: user.name
				});
			}
		});
	},

});

module.exports = StatsView;
