var express = require("express");
var router = express.Router();
const { Project } = require("../config/models");
const { validate, gihub_auther_url } = require("../src/modules/common");
const { unlock } = require("../src/modules/locker");
const Joi = require("joi");

/* GET home page. */
router.get("/", unlock, async function(request, response, next) {
  try {
    // Pagination code
    let projectCount = await Project.countDocuments();
    let pageData = {
      limit: request.query.limit || 10,
      page: request.query.page || 1,
      totalDocuments: projectCount
    };
    pageData["skip"] = pageData.limit * (pageData.page - 1);
    pageData["totalPages"] = pageData.totalDocuments / projectCount;

    let myProjects = await Project.find({ user: request.user._id })
      .sort("-createdAt")
      .limit(pageData.limit)
      .skip(pageData.skip);
    response.reply({ data: { pagination: pageData, body: myProjects } });
  } catch (err) {
    next(err);
  }
});

router.post("/", unlock, async (request, response, next) => {
  try {
    const schema = Joi.object().keys({
      name: Joi.string()
        .alphanum()
        .lowercase()
        .required(),
      github_repo: Joi.string().required(),
      trigger_branch: Joi.string()
        .alphanum()
        .required()
    });
    let data = await validate(request.body, schema);
    let existingFlag = await Project.findOne({ name: data.name });
    if (existingFlag) throw { status: 409 };
    data["user"] = request.user._id;
    // let authedUrl = gihub_auther_url(
    //   data.github_repo,
    //   request.user.github_personal_token
    // );

    console.log("authedUrl", authedUrl);
    let newProject = new Project(data);
    await newProject.save();
    response.reply({ data: newProject });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
