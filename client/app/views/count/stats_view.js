
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
		return {
			count: this.count.toJSON(),
			colorSet: colorSet
		};
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
			console.log('length: ', self.pieChart.segments.length)
			console.log('user length: ', this.count.get('users').length)
		this.count.get('users').forEach(function (elem, index) {
		console.log('pieChart beg: ', this.pieChart)
			console.log('user: ', elem)
			if (index < self.pieChart.segments.length) {
				console.log('update data')
				self.pieChart.segments[index].value = elem.expenses;
				self.pieChart.update();
			}
			else {
				console.log('add data')
						var data = {
					value: elem.expenses,
					color: '#' + elem.color,
					label: elem.name
				}
				console.log('data: ', data)
				self.pieChart.addData(data
				);
			}
		console.log('pieChart end: ', this.pieChart)
		});
	},

});

module.exports = StatsView;
