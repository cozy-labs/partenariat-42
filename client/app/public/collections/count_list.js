var Count = require('../models/count');

var CountList = Backbone.Collection.extend({
	model: Count,
    url: 'count',
});

module.exports = CountList;
