const router = require('../router');
const { getBestProfession, getBestClients } = require('../../services/jobs.service');

router.get('/admin/best-profession', async (req, res, next) => {
  const { start, end } = req.query;

  getBestProfession({ start, end })
    .then((professions) => res.json(professions))
    .catch(next);
});

router.get('/admin/best-clients', async (req, res, next) => {
  const { start, end, limit = 2 } = req.query;

  getBestClients({ start, end, limit })
    .then((clients) => res.json(clients))
    .catch(next);
});

module.exports = router;
