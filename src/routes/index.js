const contracts = require('./contracts/contracts.routes');
const jobs = require('./jobs/jobs.routes');
const balances = require('./balances/balances.routes');
const admin = require('./admin/admin.routes');

module.exports = [
  contracts,
  jobs,
  balances,
  admin,
];
