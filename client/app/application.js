// Application bootstrapper.
var Application = {
  initialize: function () {

    this.isPublic = false;
    if (window.location.pathname.indexOf('/public/') == 0) {
      this.isPublic = true;
      console.log('public');
      var Router = require('./public/router');
    } else {
      console.log('private');
      var Router = require('./private/router');
    }

    // Router initialization
    this.router = new Router();


    if (typeof Object.freeze === 'function') {
      Object.freeze(this);
    }
  }
};

module.exports = Application;
