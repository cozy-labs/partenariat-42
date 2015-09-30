
var Count = require('../models/count');



module.exports.create = function (req, res, next) {
	Count.create(req.body, function (err, newCount) {
		if (err != null && err != undefined) {
			console.error(err);
			res.status(500).send({error: "Count cannot be created"});
		}

		res.status(200).send(newCount);
	});
}
