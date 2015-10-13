var Count = require('../models/count');


module.exports.index = function (req, res, next) {
	Count.all(function (err, listCount) {
		res.render('index.jade',
			{imports: 'window.listCount = ' + JSON.stringify(listCount) + ''});
	});
};

