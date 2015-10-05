

var cozydb = require('cozydb');

var CountModel = cozydb.getModel('Count', {
  name:					String,
  description:	String,
	allExpenses:	{type: Number, default: 0},
	users:				[Object],
	history:			[Object]
});

module.exports = CountModel;
