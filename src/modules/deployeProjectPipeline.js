const node_ssh = require("node-ssh");
ssh = new node_ssh();
const { Log, Deployment } = require("../../config/models");

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

async function recordLog(obj) {
  let _log = new Log(obj);
  let res = await _log.save();
  return res;
}

async function deployeProject(project, action = "clone") {
  const { serverConfig } = project;
  let _Deployment = new Deployment({
    project: project._id
  });
  _Deployment = await _Deployment.save();
  try {
    console.log("🖥 \t SSH into remote server");
    await recordLog({
      message: "SSH into remote server",
      deployment: _Deployment._id
    });
    let conn = await ssh.connect(serverConfig);
    console.log("👍\t Connection successful");
    await recordLog({
      message: "Connection successful",
      deployment: _Deployment._id
    });
    console.log("⏱\t Running scripts");
    await recordLog({
      message: "Running scripts",
      deployment: _Deployment._id
    });

    let cmds = "";
    if (action === "clone") {
      cmds += `
      rm -rf *
      git clone ${project.repo} --single-branch --branch ${
        project.trigger_branch
      } tmp; mv tmp/* . ; rm -rf tmp
      `;
    } else {
      cmds += "git pull";
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
    await recordLog({
      message: "Scripts successful, application is live",
      deployment: _Deployment._id
    });
    return res;
  } catch (err) {
    console.log(err);
    await recordLog({
      message: JSON.stringify(err),
      deployment: _Deployment._id,
      status: "failed"
    });
    throw err;
  }
}

module.exports = deployeProject;

// deployeProject(serverConfig, project, "pull");
