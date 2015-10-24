
var BaseView = require('../../lib/base_view');


/*
 * Manage all stats in stats module
 */
var StatsView = BaseView.extend({
	el: '#stats-module',


	initialize: function (attributes) {
		this.count = attributes.count;

		BaseView.prototype.initialize.call(this);
	},



  /*
   * Create the pie chart and reder it
   */
	render: function () {
		var chartCtx = this.$('#chart-users').get(0).getContext("2d");
		var data = this.computeDataCount();
		this.pieChart = new Chart(chartCtx).Pie(data);
	},


  /*
   * Compute data needed for the pie chart. We don't add the user with 0 seed
   * because the update don't work from 0 to X value.
   */
	computeDataCount: function () {
    var data = [];
		this.count.get('users').forEach(function (elem) {
      if (Number(elem.seed) !== 0) {
        data.push({value: elem.seed, color: '#'+elem.color, label: elem.name});
      }
		});
    return data;
	},


  /*
   * Update the value of the pie chart
   */
	update: function () {
		var allExpenses = Number(this.count.get('allExpenses'));
		var nbUsers = Number(this.count.get('users').length);

		var perUserExpenses = +(Math.round(allExpenses / nbUsers * 100) / 100).toFixed(2);

    // Update the numbers of the general state (to the right of the pie chart)
		this.$('#nb-expenses').text(this.count.get('expenses').length);
		this.$('#all-expenses').text(allExpenses);
		this.$('#perUser-expenses').text(perUserExpenses);

		var self = this;

    /*
     * Main loop wiche I update/ create data to the pie chart
     */
		this.count.get('users').forEach(function (user, indexUser) {
			var indexPie = null;
      // For each user we looking him in the data of the pie chart
			self.pieChart.segments.find(function (pieSegment, index) {
				if (pieSegment.label === user.name) {
					indexPie = index;
					return true;
				}
				return false;
			})
      // If we find it we update the chart with the new data in the segment
			if (indexPie !== undefined && indexPie !== null) {
				if (user.seed == 0) {
					self.pieChart.removeData(indexPie);
				} else {
					self.pieChart.segments[indexPie].value = user.seed;
					self.pieChart.update();
				}
        // If not we create a new segment
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
