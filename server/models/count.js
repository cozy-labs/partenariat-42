

var cozydb = require('cozydb');

var CountModel = cozydb.getModel('shared-count', {
  name:			String,
  description:	String,
  allExpenses:	{type: Number, default: 0},
  users:		[Object],
  expenses:		[Object],
  currencies:	[Object],
  isPublic:     Boolean,
  status:		String,
});

module.exports = CountModel;
