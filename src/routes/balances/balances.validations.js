const { getMaxAmount } = require('../../services/balances.service');

/*
 *
 * I'm doing custom logic validations but is a more
 * future-proof solution use a schema validator
 * like Joy or Yup
 *
 */

const balanceValidation = async (req, res, next) => {
  const { ClientId } = req.params;
  const { amount } = req.body;
  const fAmount = parseFloat(amount);

  if (isNaN(fAmount) || fAmount <= 0) {
    return next({ message: `Invalid amout value`, status: 400 })
  }

  const { valid, maxAmount, balance } = await getMaxAmount({ ClientId, amount });

  if (!valid) {
    return next({ message: `Invalid operation, max amount: ${maxAmount}`, status: 400 });
  }

  req.balance = balance;
  return next();
};

module.exports = {
  balanceValidation,
};
