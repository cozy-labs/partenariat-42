
var Count = require('../models/count');

module.exports.create = function (req, res, next) {
  Count.create(req.body, function (err, newCount) {
	if (err !== null && err !== undefined) {
      return next({status: 500, msg: 'Count creation fail'});
	}
	res.status(200).send(newCount);
  });
};

module.exports.destroy = function (req, res, next) {
  Count.find(req.params.id, function (err, count) {
	if (err !== null && err !== undefined) {
      return next({status: 500, msg: 'Count not exist'});
	}

	count.destroy(function (err) {
	  if (err !== null && err !== undefined) {
        return next({status: 500, msg: 'Count destroy fail'});
	  }
	  res.status(200).send({});
	});
  });
};

module.exports.update = function (req, res, next) {
  Count.find(req.params.id, function (err, count) {
	if (err !== null && err !== undefined) {
        return next({status: 500, msg: 'Count find fail'});
	}
    if (count == null) {
        return next({status: 500, msg: 'Count find fail'});
    }

	count.updateAttributes(req.body, function (err, countUpdate) {
	  if (err !== null && err !== undefined) {
        return next({status: 500, msg: 'Count update fail'});
	  }
	  res.status(200).send(countUpdate);
	});
  });
};

module.exports.getUpdate = function (req, res, next) {
  Count.find(req.params.id, function (err, count) {
	if (err !== null && err !== undefined) {
        return next({status: 500, msg: 'Count find fail'});
	}
    if (count == null) {
        return next({status: 500, msg: 'Count find fail'});
    }
    res.status(200).send(count);
  });
};
