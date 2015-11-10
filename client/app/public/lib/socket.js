
var Count = require('../models/count');
var CountView = require('../views/count/count_view');
var app = require('../application');

function SocketListener() {
  // Parent constructor
  CozySocketListener.call(this);
};

CozySocketListener.prototype.models = {
  'shared-count': Count
};

CozySocketListener.prototype.events = [
  'shared-count.update'
];

SocketListener.prototype = Object.create(CozySocketListener.prototype);


SocketListener.prototype.onRemoteUpdate = function (model, collection) {
  console.log('event !!!!!!!: ', model)
  var printModel = app.router.mainView.count;
  if (printModel.id === model.id) {
    var view = new CountView({countName: printModel.get('name')});
    app.router.displayView(view);
  }
};

module.exports = SocketListener;
