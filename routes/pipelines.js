var express = require("express");
var router = express.Router();
const { Project, Deployment } = require("../config/models");
const { gihub_auther_url } = require("../src/modules/common");
const { unlock } = require("../src/modules/locker");
const { create_hook } = require("../src/modules/github");
const deployeProject = require("../src/modules/deployeProjectPipeline");

/* List */
router.get("/", unlock, async function(request, response, next) {
  try {
    // Pagination code
    let projectCount = await Project.countDocuments();
    let pageData = {
      limit: parseInt(request.query.limit) || 10,
      page: parseInt(request.query.page) || 1,
      totalDocuments: projectCount
    };
    pageData["skip"] = pageData.limit * (pageData.page - 1);
    pageData["totalPages"] = pageData.totalDocuments / projectCount;

    let myProjects = await Project.find({
      user: request.user._id,
      deployment_type: "pipeline"
    })
      .populate(["user"])
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
    if (!data.path && data.serverConfig) throw { status: 422 };
    let existingFlag = await Project.findOne({ name: data.name });
    if (existingFlag) throw { status: 409 };
    data["user"] = request.user._id;

    data["url"] = gihub_auther_url(
      data.github_repo,
      request.user.github_personal_token
    );

    data.deployment_type = "pipeline";

    let newProject = new Project(data);

    await newProject.save();

    let hook = await create_hook(
      newProject,
      request.user.github_personal_token
    );

    await newProject.save();
    // Trigger deploye
    await deployeProject(newProject);
    console.log("🔌 GitHub URL #", data.url);
    console.log("🚀 Github Hook", hook);
    response.reply({ data: newProject });
  } catch (err) {
    next(err);
  }
});

/* Github webhook */
router.post("/:id/webhook/:token", async (request, response, next) => {
  try {
    let id = request.params.id;

    // Save old data first
    let prevData = await Project.findOne({
      _id: id,
      token: request.params.token,
      deployment_type: "pipeline"
    }).populate(["user"]);
    if (!prevData) throw { status: 404 };

    if (request.body.ref && !request.body.ref.endsWith(prevData.trigger_branch))
      throw {
        status: 204
      };

    // generate clone url
    prevData["url"] = gihub_auther_url(
      prevData.github_repo,
      prevData.user.github_personal_token
    );

    // Trigger deploye
    await deployeProject(prevData, "pull");

    // save new container id
    prevData.status = "active";
    prevData.save();

    response.reply({ data: prevData });
  } catch (err) {
    next(err);
  }
});

/* Delete */
router.delete("/:id", unlock, async (request, response, next) => {
  try {
    let data = request.body,
      id = request.params.id;

    data["user"] = request.user._id;

    // Save old data first

    let prevData = await Project.findOne({
      _id: id,
      user: data["user"],
      deployment_type: "pipeline"
    });
    if (!prevData) throw { status: 404 };

    // Delete with new data
    prevData.remove();

    response.reply({ data: prevData });
  } catch (err) {
    next(err);
  }
});

/* Single */
router.get("/:id", unlock, async (request, response, next) => {
  try {
    let id = request.params.id;
    let user = request.user._id;

    // Save old data first
    let prevData = await Project.findOne({
      _id: id,
      user,
      deployment_type: "pipeline"
    }).populate(["user"]);
    if (!prevData) throw { status: 404 };
    prevData["deployments"] = await Deployment.find({ project: prevData._id });
    console.log(prevData["deployments"]);
    response.reply({ data: prevData });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
