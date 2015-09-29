var application = require('application');

$(function () {
	console.log('start2: ', window.test);
	application.initialize();
	Backbone.history.start();
});
