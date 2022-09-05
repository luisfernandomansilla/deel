const Sequelize = require('sequelize');
const { Job, Contract, Profile } = require('../models');

async function getMaxAmount({ ClientId, amount }) {
  const { maxAmount, balance } = await Profile.findOne({
    raw: true,
    where: { id: ClientId },
    attributes: [
      'balance',
      [Sequelize.literal('0.25 * SUM(price)'), 'maxAmount'],
    ],
    include: [
      {
        model: Contract,
        as: 'Client',
        where: {
          ClientId,
        },
        include: [
          {
            model: Job,
            where: Sequelize.and({
              paid: {
                [Sequelize.Op.not]: true,
              },
            }),
          },
        ],
      },
    ],
  });

  return {
    balance,
    maxAmount,
    valid: amount <= maxAmount,
  };
}

async function depositBalance({ ClientId, amount, balance }) {
  await Profile.update({ balance: balance + amount }, {
    where: {
      id: ClientId,
    },
  });

  return Profile.findByPk(ClientId);
}
module.exports = {
  depositBalance,
  getMaxAmount,
};
