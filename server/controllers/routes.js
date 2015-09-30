// See documentation on https://github.com/frankrousseau/americano#routes

var index = require('./index');
var count = require('./count');

module.exports = {

	'': {
		get: index.index
	},

	'countlist': {
		post: count.create
	},

	'countlist/:id': {
		delete: count.destroy
	}
};

