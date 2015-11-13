var BaseView = require('../../lib/base_view');
var app = require('../../application');

/*
 * This view represents an element of the viewCollection countListView
 */
var MenuCountRowView = BaseView.extend({

  tagName: 'li',

  /*
   * Lauch the click listener to render the count
   */
  initialize: function () {
    var self = this;
    this.$el.click(function () {
      self.printCount();
    });
  },


  getRenderData: function () {
    return {model: this.model.toJSON()};
  },

  render: function () {
    var name = this.model.get('name');
    this.$el.html('<a id="count-' + name + '">' + name + '</a>');
    this.afterRender();
    return this;
  },


  /*
   * Reroute  to the count url -> show the view main page
   */
  printCount: function () {
    app.router.navigate('count/' + this.model.get('name'), {trigger: true});
  },
});

module.exports = MenuCountRowView;
