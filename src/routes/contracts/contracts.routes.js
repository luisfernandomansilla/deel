const router = require('../router');
const getProfile = require('../../middlewares/getProfile');

const { getContractById, getContractByProfile } = require('../../services/contracts.service');

router.get('/contracts', getProfile, async (req, res, next) => {
  const profileId = req.profile.id;

  getContractByProfile({ profileId })
    .then((contracts) => res.json(contracts))
    .catch(next);
});

router.get('/contracts/:id', getProfile, async (req, res, next) => {
  const { id } = req.params;
  const profileId = req.profile.id;

  getContractById({ id, profileId })
    .then((contract) => res.json(contract))
    .catch(next);
});

module.exports = router;
