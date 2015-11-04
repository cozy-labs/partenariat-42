

module.exports = Feed = {
  axonSock: undefined,

  initialize: function (server) {
    this.logger = require('printit')({
      data: true,
      prefix: 'helper/db_feed'
    });
    this.startPublishingToAxon();
    var self = this;

    server.on('close', function () {
      if (self.axonSock !== undefined && self.axonSock !== null) {
        self.axonSock.clos()
      }
    });
  },

  startPublishingToAxon: function () {
    var axon = require('axon');
    this.axonSock = axon.socket('pub');
    axonPort = parseInt(process.env.AXON_PORT || 9105);
    this.axonSock.connect(axonPort);
    this.logger.info('Pub server started');
  },


  publish: function (event, id) {
    this.logger.info('Publishing ', + event +' ', + id);
    if (this.axonSock !== undefined && this.axonSock !== null) {
      this.axonSock.send(event, id);
    }
  }
}
