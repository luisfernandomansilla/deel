const { Profile } = require('../models');

module.exports = async (req, res, next) => {
  const id = req.get('profile_id');
  if (id) {
    const profile = await Profile.findOne({ where: { id } });
    if (!profile) return res.status(401).end();
    req.profile = profile;
  } else {
    return res.status(401).end();
  }

  return next();
};
