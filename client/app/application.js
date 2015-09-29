var UserList = require('collections/user_list');

// Application bootstrapper.
var Application = {
	initialize: function () {
		console.log('start3: ', window.test);
		throw new Error('toto');
		var Router = require('./router');

		// Ideally, initialized classes should be kept in controllers & mediator.
		// If you're making big webapp, here's more sophisticated skeleton
		// https://github.com/paulmillr/brunch-with-chaplin


		this.router = new Router();


		if (typeof Object.freeze === 'function') {
			Object.freeze(this);
		}
	}
};

module.exports = Application;
