var express = require("express");
var router = express.Router();
const { Project } = require("../config/models");
const { gihub_auther_url } = require("../src/modules/common");
const { unlock } = require("../src/modules/locker");
const {
  dockerize,
  delete_container,
  stop_container,
  container_logs
} = require("../src/modules/docker");
const { create_hook } = require("../src/modules/github");
let { nextAvailable } = require("node-port-check");

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
    let existingFlag = await Project.findOne({ name: data.name });
    if (existingFlag) throw { status: 409 };
    data["user"] = request.user._id;

    data["url"] = gihub_auther_url(
      data.github_repo,
      request.user.github_personal_token
    );

    data.port = await nextAvailable("3000", "0.0.0.0");

    let newProject = new Project(data);
    await newProject.save();

    let container_id = await dockerize({
      ...newProject.toJSON(),
      repo: data["url"]
    });

    newProject.container = container_id;
    await newProject.save();

    let hook = await create_hook(
      newProject,
      request.user.github_personal_token
    );

    console.log("🔌 Port #", data.port);
    console.log("🚀 Github Hook", hook);
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

    // Do not let name update
    delete request.body["name"];

    // Save old data first
    let prevData = await Project.findOne({ _id: id, user: data["user"] });
    if (!prevData) throw { status: 404 };
    console.log(prevData);
    // Update with new data
    let updatedProject = await Project.findOneAndUpdate(
      { _id: id },
      { $set: data },
      { new: true }
    );

    // generate clone url
    let git_url = gihub_auther_url(
      updatedProject.github_repo,
      request.user.github_personal_token
    );

    if (updatedProject.status === "inActive") {
      await stop_container(prevData.container);
      // await delete_container(prevData.container);
    } else {
      // Delete old project
      await delete_container(prevData.container);

      // Clone project in it's destination
      let container_id = await dockerize({
        ...updatedProject.toJSON(),
        repo: git_url
      });

      // save new container id
      updatedProject.container = container_id;
      updatedProject.save();
    }

    response.reply({ data: updatedProject });
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
      token: request.params.token
    }).populate(["user"]);
    if (!prevData) throw { status: 404 };

    if (!request.body.ref.endsWith(prevData.trigger_branch))
      throw {
        status: 204
      };

    // generate clone url
    let git_url = gihub_auther_url(
      prevData.github_repo,
      prevData.user.github_personal_token
    );

    // Delete old project
    await delete_container(prevData.container);

    // Clone project in it's destination
    let container_id = await dockerize({
      ...prevData.toJSON(),
      repo: git_url
    });

    // save new container id
    prevData.status = "active";
    prevData.container = container_id;
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
    let prevData = await Project.findOne({ _id: id, user: data["user"] });
    if (!prevData) throw { status: 404 };

    // Delete old project
    await delete_container(prevData.container);

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
    let prevData = await Project.findOne({ _id: id, user }).populate(["user"]);
    if (!prevData) throw { status: 404 };

    response.reply({ data: prevData });
  } catch (err) {
    next(err);
  }
});

/* Logs */
router.get("/:id/logs", unlock, async (request, response, next) => {
  try {
    let id = request.params.id;

    let user = request.user._id;

    // Save old data first
    let prevData = await Project.findOne({ _id: id, user }).populate(["user"]);
    if (!prevData) throw { status: 404 };

    // Fetch logs
    let stream = await container_logs(prevData.container);

    // Need to change it to socket.io
    let logsout = await new Promise((resolve, reject) => {
      stream.on("data", info => resolve(info.toString("base64")));
      stream.on("error", err => resolve(err.toString("base64")));
    });

    response.reply({ data: { body: logsout, dType: "base64" } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
