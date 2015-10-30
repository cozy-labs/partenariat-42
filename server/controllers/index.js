var Count = require('../models/count');


module.exports.index = function (req, res, next) {
  Count.all(function (err, listCount) {
    res.render('index.jade',
        {imports: 'window.listCount = ' + JSON.stringify(listCount) + ''});
  });
};

module.exports.public = function (req, res, next) {
  Count.find(req.params.id, function (err, count) {
    if (err !== null && err !== undefined) {
      console.error('Finding public url error');
      res.render('404.jade');
    }
    if (count === null) {
      console.log('Bad public url recieve');
      res.render('404.jade');
      return;
    }

    res.render('index_public.jade',
        {imports: 'window.count = ' + JSON.stringify(count) + ''});
  });
};
