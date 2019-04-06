const { Docker } = require("node-docker-api");
const { docker_sock } = require("../../config/keys");

const docker = new Docker({ socketPath: docker_sock });

const project = {
  git_meta: {
    repo:
      "https://d1cfcd9e6ee418a96eb8c8a54d67e17aa8e9ab1b:x-oauth-basic@github.com/mkhizeryounas/express-mongo",
    branch: "develop"
  },
  env: [
    `mongodb="mongodb://mkhizeryounas:Mkhizer#321@ds159737.mlab.com:59737/dropspot"`
  ]
};

project["envString"] = "";
project.env.map(e => (project.envString += e + "\n"));

docker.container
  .create({
    Image: "node",
    Cmd: [
      "sh",
      "-c",
      `
      git clone ${project.git_meta.repo} --single-branch --branch ${
        project.git_meta.branch
      } app 
      cd app
      echo ${project.envString} >> .env
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
