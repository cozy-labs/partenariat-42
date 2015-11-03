

module.exports = function (err, req, res, next) {
  if (err.msg) {
    var print = new Error(err.msg);
  } else {
    var print = new Error();
  }
  console.error(print);

  if (err.status == 404) {
      return res.render('404.jade');
  }

  res.status(err.status).send(err);
}
