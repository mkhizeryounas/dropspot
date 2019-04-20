var express = require("express");
var router = express.Router();
const { Project } = require("../config/models");
const { gihub_auther_url } = require("../src/modules/common");
const { unlock } = require("../src/modules/locker");
const { create_hook } = require("../src/modules/github");
const { nextAvailable } = require("node-port-check");

/* GET home page. */
router.get("/", async function(req, res, next) {
  res.reply({ data: { title: "Express" } });
});
/* Create */
router.post("/", unlock, async (request, response, next) => {
  try {
    let data = request.body;
    let existingFlag = await Project.findOne({ name: data.name });
    // if (existingFlag) throw { status: 409 };
    data["user"] = request.user._id;

    data["url"] = gihub_auther_url(
      data.github_repo,
      request.user.github_personal_token
    );

    data.port = await nextAvailable("3000", "0.0.0.0");

    let newProject = new Project(data);

    await newProject.save();

    let hook = await create_hook(
      newProject,
      request.user.github_personal_token
    );

    await newProject.save();

    console.log("🔌 GitHub URL #", data.url);
    console.log("🚀 Github Hook", hook);
    response.reply({ data: newProject });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
