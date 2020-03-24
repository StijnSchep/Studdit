const logger = require("../config/appconfig").logger;

const User = require("../models/user.model");

module.exports.create = async function(req, res, next) {
  try {
    const user = new User(req.body);
    await user.save();

    // Success, return full user object
    res.status(200).json(user);
  } catch (err) {
    logger.info(err);
    const errorObject = {
      message: err._message,
      errors: err.errors,
      code: 400
    };
    next(errorObject);
  }
};

// TODO: Update changes password, param1: password, param2: newPassword
module.exports.update = async function(req, res, next) {
  const userName = req.params.name;

  if (!userName || userName == "") {
    const errorObject = {
      message: "No username specified",
      code: 204
    };
    next(errorObject);
    return;
  }

  const toBeUpdated = await User.findOne({
    name: userName,
    password: req.body.password
  });
  if (!toBeUpdated) {
    const errorObject = {
      message: "Current password is invalid",
      code: 401
    };
    next(errorObject);
    return;
  }

  toBeUpdated.password = req.body.newPassword;
  try {
    await toBeUpdated.save();
    res.status(200).json({ message: "Password is saved" });
  } catch (err) {
    logger.info(err);
    const errorObject = {
      message: "Something went wrong while saving the new password",
      code: 500
    };
    next(errorObject);
  }
};

//TO DO: deletes user with correct password: param1: current password
module.exports.delete = async function(req, res, next) {
  const userName = req.params.name;

  const toBeDeleted = await User.findOne({
    name: userName,
    password: req.body.password
  });
  if (!toBeDeleted) {
    // Password invalid
    const errorObject = {
      message: "Password is invalid",
      code: 401
    };
    next(errorObject);
    return;
  }

  try {
    await toBeDeleted.remove();
    res.status(200).json({ message: "User has been deleted" });
  } catch (err) {
    logger.info(err);
    const errorObject = {
      message: "Something went wrong while deleting user",
      code: 500
    };
    next(errorObject);
  }
};
