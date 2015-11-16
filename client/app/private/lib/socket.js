/*global
 CozySocketListener
 */
var Count = require('../models/count');
var CountView = require('../views/count/count_view');
var app = require('../application');

/*
 * Manage the real-time
 */
function SocketListener() {
  // Parent constructor
  CozySocketListener.call(this);
}

SocketListener.prototype = Object.create(CozySocketListener.prototype);

/*
 * Listen the dataype "shared-count"
 */
CozySocketListener.prototype.models = {
  'shared-count': Count
};

/*
 * Listen the "update" action
 */
CozySocketListener.prototype.events = [
  'shared-count.update'
];


/*
 * Is trigger after update the model in collection. Create a complete
 * re-rendering
 * if the updated count is the one currently printed, in other case, do nothing.
 *
 * This is basic but without real-time any count modification lead to a page
 * rendering except the user-adding so currently there isn't methode to make
 * hot update
 */
SocketListener.prototype.onRemoteUpdate = function (model, collection) {
  var printModel = app.router.mainView.count,
    view = null;

  if (printModel.id === model.id) {
    view = new CountView({countName: printModel.get('name')});
    app.router.displayView(view);
  }
};

module.exports = SocketListener;
