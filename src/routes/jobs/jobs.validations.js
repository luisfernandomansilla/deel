const payJobByIdValidations = (req, res, next) => {
  const { profile } = req;

  if (profile.balance <= 0) {
    throw { message: 'Error not enough balance', status: 400 };
  }

  if (profile.type !== 'client') {
    throw { message: 'Only clients can pay', status: 401 };
  }

  return next();
};

module.exports = {
  payJobByIdValidations,
};
