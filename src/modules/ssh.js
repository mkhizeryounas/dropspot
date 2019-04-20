const node_ssh = require("node-ssh");
ssh = new node_ssh();

const serverConfig = {
  host: "165.227.62.23",
  port: 22,
  username: "root",
  password: "codextech@123"
};

const project = {
  repo:
    " https://bb1207352ffdc45e96dda93e226e0433ff4928fe:x-oauth-basic@github.com/mkhizeryounas/express-mongo",
  trigger_branch: "master",
  token: "175df4a5-bb02-4b70-ac62-8110dbaddc95",
  container: "",
  build: "npm install",
  script: "./bin/www",
  env: [
    "mongodb=mongodb://mkhizeryounas:Mkhizer_321@ds121726.mlab.com:21726/shopdesk-oauth-test",
    "PORT=1122"
  ],
  status: "active",
  port: "",
  path: "/root/dropspot-cd",
  deployment_type: "pipeline",
  _id: "5cbb8f847e1331f12a933bef",
  name: "expressmongo1333",
  github_repo: "https://github.com/mkhizeryounas/express-mongo",
  language: "nodejs",
  user: "5ca67d1f992045048b382bae",
  createdAt: "2019-04-20T21:30:44.692Z",
  updatedAt: "2019-04-20T21:30:44.692Z",
  __v: 0
};

function nodeEcoSystemFile(project) {
  let env = {};
  project.env.map(e => {
    let keyValue = e.split("=");
    env[keyValue[0]] = keyValue[1];
  });
  let file = {
    apps: [
      {
        name: project.name,
        script: project.script,
        env
      }
    ]
  };
  return JSON.stringify(file);
}

async function deployeProject(serverConfig, project, action = "clone") {
  console.log("🖥 \t SSH into remote server");
  let conn = await ssh.connect(serverConfig);
  console.log("👍\t Connection successful");
  console.log("⏱\t Running scripts");

  let cmds = "";
  if (action === "clone") {
    cmds += `
    rm -rf *
    git clone ${project.repo} --single-branch --branch ${
      project.trigger_branch
    } tmp; mv tmp/* . ; rm -rf tmp
    `;
  } else {
    cmd += "git pull";
  }
  cmds = `
  ${project.build || ""}
  `;

  // Supported Platforms Commands
  if (project.language === "nodejs") {
    let envFile = `module.exports = ${nodeEcoSystemFile(project)}`;
    cmds += `
    echo '${envFile}' > ecosystem.config.js
    pm2 start ecosystem.config.js
    `;
  }

  let res = {};
  res = await conn.execCommand(cmds, { cwd: project.path });
  conn.dispose();
  console.log("💣", res);
  console.log("⚡️\t Scripts successful, application is live");
  return res;
}

module.exports = deployeProject;

deployeProject(serverConfig, project);
