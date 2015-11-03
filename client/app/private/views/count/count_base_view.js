// Requirements
var BaseView = require('../../lib/base_view');
var app = require('../../application');

// Modules
var StatsView = require('./stats_view');
var SquareView = require('./square_view');


/*
 * CountBaseView is a generique class wiche is call in count and archive. There
 * are both exactly the same stucture but just more or less actions
 */
var CountBaseView = BaseView.extend({
  template: require('./templates/count'),


  /*
   * If count is undefined that mean I haven't find it in the collection so it's
   * a bad url. I redirect to the mainBoard
   */
	initialize: function () {
		if (this.count == undefined || this.count == null) {
			console.error('invalide route');
      app.router.navigate('', {trigger: true});
		}

		BaseView.prototype.initialize.call(this);
	},


  /*
   * Call in render in BaseView class. Render the data to the template
   */
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


  /*
   * Render stats module
   */
	afterRender: function () {
      if (this.count.get('expenses').length > 0) {
        this.stats = new StatsView({count: this.count});
        this.stats.render();
      }
	},


  /*
   * The balancing is by default not printed so I don't create it unless it's
   * required.
   */
	printBalancing: function () {
		if (this.balancing === null || this.balancing === undefined) {
			this.balancing = new SquareView({count: this.count});
			this.balancing.render();
		}
		this.balancing.clickDisplayer()
	},
});

module.exports = CountBaseView;
