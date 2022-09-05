const Sequelize = require('sequelize');
const sequelize = require('./db.service');
const { Job, Contract, Profile } = require('../models');

async function getUnpaidJobs({ profileId }) {
  return Job.findAll({
    where: {
      paid: {
        [Sequelize.Op.not]: true,
      },
    },
    include: [
      {
        model: Contract,
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
      },
    ],
  });
}

async function payJobById({ id, profile }) {
  /*
    *  Since we are dealing with money, we should use bigNumber arithmetics
    *  and an idempotent pattern for the transaction
    *  Due lack of time I can't do it
    */

  return sequelize.transaction(async (transaction) => {
    await Job
      .update({ paid: true }, {
        transaction,
        where: Sequelize.and(
          {
            id,
            paid: {
              [Sequelize.Op.not]: true,
            },
            price: {
              [Sequelize.Op.lte]: profile.balance,
            },
          },
        ),
        include: [
          {
            model: Contract,
            where: {
              ClientId: profile.id,
            },
          },
        ],
      })
      .then(([isJobPayed]) => {
        if (!isJobPayed) {
          throw { message: `Error paying Job: ${id}`, status: 400 };
        }
      });

    // Returning a row from model.update() is not supported by sqlite
    const { price } = await Job.findByPk(id, { attributes: ['price'] });
    const balance = profile.balance - price;

    await Profile
      .update({ balance }, {
        transaction,
        where: {
          id: profile.id,
        },
      })
      .then(([isBalanceReduced]) => {
        if (!isBalanceReduced) {
          throw { message: 'Error extracting balance from client', status: 400 };
        }
      });

    return {
      paid: true,
      price,
      id,
      balance,
    };
  });
}

async function getBestProfession({ start, end }) {
  const jobs = await Job.findAll({
    raw: true,
    where: Sequelize.and(
      {
        paid: {
          [Sequelize.Op.eq]: true,
        },
      },
      {
        updatedAt: {
          [Sequelize.Op.between]: [start, end],
        },
      },
    ),
    include: [
      {
        model: Contract,
        include: [
          {
            model: Profile,
            as: 'Contractor',
          },
        ],
      },
    ],
  }) || [];

  /*
   *   Using a table lookup to aggregate profession payments
   *   from Line 168 to line 173 you can see an example of an SQL aggregation
   */
  const professions = jobs.reduce((acc, job) => {
    const profession = job['Contract.Contractor.profession'];
    return {
      ...acc,
      [profession]: acc[profession] ? acc[profession] + job.price : job.price,
    };
  }, {});

  const [bestProfession] = Object
    .entries(professions)
    .sort((a, b) => b[1] - a[1])
    .map(([jobName]) => jobName);

  return bestProfession;
}

async function getBestClients({ start, end, limit }) {
  const jobs = await Job.findAll({
    raw: true,
    where: Sequelize.and(
      {
        paid: {
          [Sequelize.Op.eq]: true,
        },
      },
      {
        updatedAt: {
          [Sequelize.Op.between]: [start, end],
        },
      },
    ),
    limit,
    order: [
      ['paid', 'DESC'],
    ],

    /*
     *
     * Is not clear on the readme if I need to sum al the payments or list all of them!!!
     * So I decided to aggregate it
     *
     */
    group: 'Contract.Client.id',
    attributes: [
      [Sequelize.fn('sum', Sequelize.col('price')), 'paid'],
      [Sequelize.literal("firstName || ' ' || lastName"), 'fullName'],
      [Sequelize.col('Contract.Client.id'), 'id'],
    ],
    include: [
      {
        model: Contract,
        include: [
          {
            model: Profile,
            as: 'Client',
          },
        ],
      },
    ],
  });

  return jobs.map(({ id, paid, fullName }) => ({ id, paid, fullName }));
}

module.exports = {
  getUnpaidJobs,
  payJobById,
  getBestProfession,
  getBestClients,
};
