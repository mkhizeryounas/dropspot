const { Docker } = require("node-docker-api");
const { docker_sock } = require("../../config/keys");

const docker = new Docker({ socketPath: docker_sock });

const git_meta = {
  repo:
    "https://d1cfcd9e6ee418a96eb8c8a54d67e17aa8e9ab1b:x-oauth-basic@github.com/mkhizeryounas/express-mongo",
  branch: "develop"
};

docker.container
  .create({
    Image: "node",
    Cmd: [
      "sh",
      "-c",
      `
      git clone ${git_meta.repo} app 
      cd app
      git checkout ${git_meta.branch}
      npm install
      npm start
      `
    ],
    Workdir: ".",
    name: "test"
  })
  .then(container => {
    console.log(container);
    container.start();
  });
