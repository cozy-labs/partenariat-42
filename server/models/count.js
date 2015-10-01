

var cozydb = require('cozydb');

var CountModel = cozydb.getModel('Count', {
  name:					String,
  description:	String,
	users:				[String]
});

module.exports = CountModel;
