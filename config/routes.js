// Declare all routes in rote config file

var indexRouter = require("../routes/index");
var usersRouter = require("../routes/users");
var projectsRouter = require("../routes/projects");
var appsRouter = require("../routes/apps");
var pipelinesRouter = require("../routes/pipelines");

module.exports = app => {
  app.use("/", indexRouter);
  app.use("/users", usersRouter);
  // app.use("/projects", projectsRouter);
  app.use("/apps", appsRouter);
  app.use("/pipelines", pipelinesRouter);
};
