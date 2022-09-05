const router = require('../router');
const getProfile = require('../../middlewares/getProfile');
const { payJobByIdValidations } = require('./jobs.validations');
const { getUnpaidJobs, payJobById } = require('../../services/jobs.service');

router.get(
  '/jobs/unpaid',
  getProfile,
  async (req, res, next) => {
    const profileId = req.profile.id;

    getUnpaidJobs({ profileId })
      .then((jobs) => res.json(jobs))
      .catch(next);
  },
);

router.post(
  '/jobs/:id/pay',
  getProfile,
  payJobByIdValidations,
  (req, res, next) => {
    const { id } = req.params;
    const { profile } = req;

    payJobById({ profile, id })
      .then((job) => res.json(job))
      .catch(next);
  },
);

module.exports = router;
