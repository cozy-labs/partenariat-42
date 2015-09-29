var americano = require('americano');
var path = require('path');


var staticMiddleware = americano.static(path.resolve(__dirname, '../client/public'), {maxAge: 86400000});
var viewStatic = function (req, res, next) {

	//Allows assets to be loaded from any route
	detectAssets = /\/(stylesheets|javascripts|images|fonts)+\/(.+)$/;
	assetsMatched = detectAssets.exec(req.url);

	if (assetsMatched !== null && assetsMatched !== undefined) {
		req.url = assetMatched[0];
	}

	staticMiddleware(req, res, function (err) {
		next(err);
	});

}


var config = {
	common: {
		use: [
			staticMiddleware,
			viewStatic,
			americano.bodyParser({keepExtensions: true}),
		],
		afterStart: function (app, server) {
			app.use(americano.errorHandler({dumpExceptions: true, showStack: true}));
		},
		set: {
			views: path.resolve(__dirname, 'views/')
		},
		engine: {
			js: function (path, locales, callback) {
				callback(null, require(path)(locales));
			}
		},
	},
	development: [
		americano.logger('dev')
	],
	production: [
		americano.logger('short')
	],
	plugins: [
		'cozydb'
	]
};

module.exports = config;
