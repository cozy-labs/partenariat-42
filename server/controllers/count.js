
var Count = require('../models/count');



module.exports.create = function (req, res, next) {
	console.log('bosy: ', req.body)
	Count.create(req.body, function (err, newCount) {
		if (err !== null && err !== undefined) {
			console.error(err);
			res.status(500).send({error: "Count creation fail"});
		}

		res.status(200).send(newCount);
	});
}

module.exports.destroy = function (req, res, next) {
	Count.find(req.params.id, function (err, count) {
		if (err !== null && err !== undefined) {
			console.error(err);
			res.status(500).send({error: "Count not exist"});
			return;
		}

		count.destroy(function (err) {
			if (err !== null && err !== undefined) {
				console.error(err);
				res.status(500).send({error: 'Count destroy fail'});
				return;
			}
			res.status(200).send({});
		});
	});
}

module.exports.update = function (req, res, next) {
	Count.find(req.params.id, function (err, count) {
			if (err !== null && err !== undefined) {
				res.status(500).send({error: 'Count find fail'});
				return;
			}

		count.updateAttributes(req.body, function (err, countUpdate) {
			if (err !== null && err !== undefined) {
				res.status(500).send({error: 'Count update fail'});
			}
			res.status(200).send(countUpdate);
		});
	});
}
