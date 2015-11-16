var CountBaseView = require('./count_base_view');
var app = require('../../application');

/*
 * View for all the archived count, based on the countBaseView (as count).
 */
var ArchiveView = CountBaseView.extend({
  id: 'archive-screen',

  count: null,
  dataResume: {
    allExpense: 0,
  },

  newExpense: null,
  balancing: null,

  events: {
    'click #header-balancing':  'printBalancing',
  },

  initialize: function (attributes) {
    this.count = window.archiveCollection.models.find(function (count) {
      return count.get('name') === attributes.countName;
    });

    CountBaseView.prototype.initialize.call(this);
  },


});

module.exports = ArchiveView;
