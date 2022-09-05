const Sequelize = require('sequelize');
const { Contract } = require('../models');

async function getContractById({ id, profileId }) {
  return Contract.findOne({
    where: Sequelize.and(
      { id },
      Sequelize.or(
        { ClientId: profileId },
        { ContractorId: profileId },
      ),
    ),
  }).then((contract) => {
    if (contract) return contract;
    throw { status: 404, message: 'not found' };
  });
}

async function getContractByProfile({ profileId }) {
  return Contract.findAll({
    where: Sequelize.and(
      {
        status: {
          [Sequelize.Op.not]: 'terminated',
        },
      },
      Sequelize.or(
        { ClientId: profileId },
        { ContractorId: profileId },
      ),
    ),
  });
}

module.exports = {
  getContractById,
  getContractByProfile,
};
