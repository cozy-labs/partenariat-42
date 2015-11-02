
var Count = require('../models/count');


module.exports.checkClearance = function (req, res, next) {
  Count.find(req.body.id, function (err, count) {
  });

  console.log('params: ', req.params);
  console.log('data: ', req.body);
}


