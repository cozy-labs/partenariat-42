// See documentation on https://github.com/frankrousseau/americano#routes

var index = require('./index');
var count = require('./count');

module.exports = {

  '': {
	get: index.index
  },

  'count': {
	post: count.create
  },

  'count/:id': {
	delete: count.destroy,
	put: count.update
  },

  'public/count/:id': {
    get: index.public
  }

};

