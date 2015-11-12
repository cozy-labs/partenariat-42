

module.exports = function (err, req, res, next) {
  var print = (err.msg) ? (new Error(err.msg)) : (new Error());
  console.error(print);

  if (err.status === 404) {
    return res.render('404.jade');
  }

  res.status(err.status).send(err);
};
