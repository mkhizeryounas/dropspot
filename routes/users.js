const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { User } = require("../config/models");
const { validate } = require("../src/modules/common");
const { lock, unlock } = require("../src/modules/locker");

/* GET users listing. */
router.get("/", unlock, function(request, response, next) {
  try {
    response.reply({ data: request.user });
  } catch (err) {
    next(err);
  }
});

router.post("/signup", async (request, response, next) => {
  try {
    const schema = Joi.object().keys({
      username: Joi.string()
        .alphanum()
        .lowercase()
        .required(),
      password: Joi.string()
        .alphanum()
        .required(),
      github_personal_token: Joi.string().required()
    });
    let data = await validate(request.body, schema);
    let existingFlag = await User.findOne({ username: data.username });
    if (existingFlag) throw { status: 409 };
    let newUser = new User(data);
    await newUser.save();
    response.reply({ data: newUser });
  } catch (err) {
    next(err);
  }
});

router.post("/signin", async (request, response, next) => {
  try {
    const schema = Joi.object().keys({
      username: Joi.string()
        .alphanum()
        .required(),
      password: Joi.string()
        .alphanum()
        .required()
    });
    let data = await validate(request.body, schema);
    let _user = await User.findOne({ username: data.username }).toJSON;
    if (!_user) throw { status: 401 };
    await _user.checkPassword(data.password);
    const creds = lock(_user);
    response.reply({ data: creds });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
