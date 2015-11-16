/*global
 Chart
 */
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
   * Create the pie chart and render it
   */
  render: function () {
    var chartCtx = this.$('#chart-users').get(0).getContext("2d"),
      data = this.computeDataCount();
    this.pieChart = new Chart(chartCtx).Pie(data);
  },


  /*
   * Compute data needed in the pie chart. We don't add the user with 0 seed
   * because the update don't work from 0 to X value.
   */
  computeDataCount: function () {
    var data = [];
    this.count.get('users').forEach(function (elem) {
      if (Number(elem.seed) !== 0) {
        data.push({value: elem.seed, color: '#' + elem.color,
          label: elem.name});
      }
    });
    return data;
  },


  /*
   * Update the value of the pie chart
   */
  update: function () {
    var allExpenses = Number(this.count.get('allExpenses')),
      nbUsers = Number(this.count.get('users').length),
      perUserExpenses = +(Math.round(allExpenses / nbUsers * 100) /
          100).toFixed(2),
      self = this;

    // Update the numbers of the general state (to the right of the pie chart)
    $('#nb-expenses').text(this.count.get('expenses').length);
    $('#all-expenses').text(allExpenses);
    $('#perUser-expenses').text(perUserExpenses);


    /*
     * Main loop where data for the pie chart is updated/created
     */
    this.count.get('users').forEach(function (user, indexUser) {
      var indexPie = null;
      // For each user is looked up in the pie chart's data
      self.pieChart.segments.find(function (pieSegment, index) {
        if (pieSegment.label === user.name) {
          indexPie = index;
          return true;
        }
        return false;
      });
      // If we find it we update the chart with the new data in the segment
      if (indexPie !== undefined && indexPie !== null) {
        if (user.seed === 0) {
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
