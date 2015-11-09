
var Count = require('../models/count');


var SocketListener = _.extend(CozySocketListener, {
  models: {
    'shared-count': Count
  },

  events: [ 'shared-count.*' ],

  onRemoteUpdate: function (model, collection) {
    console.log('remote update');
  },

});


module.exports = SocketListener;
