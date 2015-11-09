
var Count = require('../models/count');


module.exports.checkClearance = function () {

  return function (req, res, next) {
      Count.find(req.params.id, function (err, count) {
        if (err !== undefined && err !== null) {
          return next(err);
        }

        if (count == null) {
          console.error('Fail to retrieve count');
          var err = new Error('Fail to retrieve data');
          err.status = 404;
          return next(err);
        }

        if (count.isPublic !== true) {
          return next({status: 404, msg: "Bad permission"});
        }

        next();
      });
  }
}


