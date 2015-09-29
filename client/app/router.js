
var HomeView = require('views/home_view');

var Router = Backbone.Router.extend({

	mainView: null,

	routes: {
		''		: 'mainBoard'
	},


	mainBoard: function () {
		console.log('start: ', window.test);
		view = new HomeView();

		this.displayView(view);
	},


	displayView: function (view) {
		if (this.mainView !== null) {
			this.mainView.remove();
		}
		this.mainView = view;
		$('.application').append(view.$el);
		view.render();
	}



});

module.exports = Router;
