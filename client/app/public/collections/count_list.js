var Count = require('../models/count');

/*
 * Manage a list of count like countCollection or archiveCollection.
 *
 */
var CountList = Backbone.Collection.extend({
  model: Count,
  url: 'count',
});

module.exports = CountList;
