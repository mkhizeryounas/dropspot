var express = require("express");
var router = express.Router();
const { Project } = require("../config/models");
const { gihub_auther_url } = require("../src/modules/common");
const { unlock } = require("../src/modules/locker");
const { clone } = require("../git-scripts");

/* List */
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

/* Create */
router.post("/", unlock, async (request, response, next) => {
  try {
    let data = request.body;
    let existingFlag = await Project.findOne({ name: data.name });
    if (existingFlag) throw { status: 409 };
    data["user"] = request.user._id;

    data["url"] = gihub_auther_url(
      data.github_repo,
      request.user.github_personal_token
    );

    let newProject = new Project(data);
    await newProject.save();

    // Clone project in it's destination
    await clone({ ...newProject.toJSON(), url: data["url"] });

    response.reply({ data: newProject });
  } catch (err) {
    next(err);
  }
});

/* Update */
router.patch("/:id", unlock, async (request, response, next) => {
  try {
    let data = request.body,
      id = request.params.id;

    data["user"] = request.user._id;

    // data["url"] = gihub_auther_url(
    //   data.github_repo,
    //   request.user.github_personal_token
    // );

    // let newProject = new Project(data);
    // await newProject.save();

    // Clone project in it's destination
    // await clone({ ...newProject.toJSON(), url: data["url"] });

    let updatedProject = await Project.findOneAndUpdate(
      { _id: id },
      { $set: data },
      { new: true }
    );

    let git_url = gihub_auther_url(
      updatedProject.github_repo,
      request.user.github_personal_token
    );

    console.log(git_url);

    // Delete old project

    // Clone project in it's destination

    response.reply({ data: updatedProject });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
