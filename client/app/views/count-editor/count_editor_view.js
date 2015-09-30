var BaseView = require('../../lib/base_view');
var template = require('./templates/count_editor');
var app = require('../../application');


var CountEditor = BaseView.extend({
	id: 'count-editor-screen',
  template: template,

	events: {
		'click #submit-create-count':	'laucheCountCreation',
	},


	laucheCountCreation: function () {
		window.countCollection.create({
			name: this.$('#input-name').val(),
			description: this.$('#input-description').val(),
		});
		app.router.navigate('', {trigger: true});
	}


});

module.exports = CountEditor;
