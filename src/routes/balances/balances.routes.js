const router = require('../router');

const { balanceValidation } = require('./balances.validations');
const { depositBalance } = require('../../services/balances.service');

router.post(
  '/balances/deposit/:ClientId',
  balanceValidation,
  (req, res, next) => {
    const { ClientId } = req.params;
    const { amount } = req.body;
    const { balance } = req;

    depositBalance({ ClientId, amount, balance })
      .then((profile) => res.json(profile))
      .catch(next);
  },
);

module.exports = router;
