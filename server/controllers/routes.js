// See documentation on https://github.com/frankrousseau/americano#routes

var index = require('./index');
var count = require('./count');
var public_auth = require('../middleware/public_auth');

module.exports = {

  '': {
	get: index.index
  },

  'count': {
	post: count.create
  },

  'public/count/:id': {
    get: [public_auth.checkClearance(), index.public],
    put: [public_auth.checkClearance(), count.update],
  },

  'count/:id': {
	delete: count.destroy,
	put: count.update,
    get: count.getUpdate,
  },

};

