// Application bootstrapper.
var Application = {
  initialize: function () {

    var Router = require('./router');

    // Router initialization
    this.router = new Router();


    if (typeof Object.freeze === 'function') {
      Object.freeze(this);
    }
  }
};

module.exports = Application;
