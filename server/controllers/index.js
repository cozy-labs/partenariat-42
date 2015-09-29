
module.exports.index = function (req, res, next) {
	console.log('plop');
	res.render('index.jade', {imports: "window.test = \"plop\";"}, function (err, html) {
		if (err) {
			console.error(err);
		}
		console.log('html: ', html);
	});
};

