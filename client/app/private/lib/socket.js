
var Count = require('../models/count');

//var SocketListener = _.extend(CozySocketListener, {});
//});


function SocketListener() {
  // Parent constructor
  CozySocketListener.call(this);

  // Public attributes
  models = {
    'shared-count': Count
  };

  events = [ 'shared-count.*' ];

};

SocketListener.prototype = Object.create(CozySocketListener.prototype);


//SocketListener.onRemoteUpdate: function (model, collection) {
  //console.log('remote update');
//};

SocketListener.prototype.process = function (event) {
  console.log('event: ', event);
};



module.exports = SocketListener;
