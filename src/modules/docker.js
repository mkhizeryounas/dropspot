const { Docker } = require("node-docker-api");
const { docker_sock } = require("../../config/keys");

const docker = new Docker({ socketPath: docker_sock });

const dockerize = async project => {
  let container;
  try {
    project.env.push("PORT=8080");
    project["envString"] = "";
    project.env.map(e => {
      project.envString += `echo ${e} >> .env \n`;
    });

    console.log("project", project);

    container = await docker.container.create({
      Image: "node",
      Cmd: [
        "sh",
        "-c",
        `
          git clone ${project.repo} --single-branch --branch ${
          project.trigger_branch
        } app 
          cd app
          ${project.envString}
          ${project.build}
          ${project.script}
        `
      ],
      Workdir: ".",
      name: project.name,
      ExposedPorts: { "8080/tcp": {} },
      PortBindings: { "8080/tcp": [{ HostPort: project.port }] }
    });
    console.log("Docker Success", container);
    container.start();
    return container.data.Id;
  } catch (err) {
    console.log("Docker Error", err);
    if (container) await container.delete({ force: true });
    throw err;
  }
};

const stop_container = async id => {
  let container = docker.container.get(id);
  if (container) return container.stop();
  return false;
};

const delete_container = async id => {
  let container = docker.container.get(id);
  if (container) return container.delete({ force: true });
  return false;
};

const container_logs = async id => {
  let container = docker.container.get(id);
  if (container) {
    return constainer.logs({
      follow: false,
      stdout: true,
      stderr: true
    });
  }
  return false;
};

module.exports = {
  dockerize,
  delete_container,
  stop_container,
  container_logs
};
