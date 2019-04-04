const exec = require("child_process").exec;
const { base_dir } = require("../config/keys");

const clone = async arg => {
  try {
    arg.env["PORT"] = arg.port;
    const ecosystemFile = `module.exports = {
      apps: [
        {
          name: "${arg.project}",
          script: "${arg.script}",
          env: ${JSON.stringify(arg.env)}
        }
      ]
    };`;

    const passFlags = `
      kill-port ${arg.port}
      cd ${arg.path}
      rm -rf ${arg.project}
      git clone ${arg.url} ${arg.project}
      cd ${arg.project}
      ${arg.build}
      echo '${ecosystemFile}' >> ecosystem.config.js
      pm2 start ecosystem.config.js
    `;

    let res = await shell_interface(passFlags);
    console.log(res);
  } catch (err) {
    console.log("Err", err);
  }
};

const shell_interface = async passFlags => {
  return new Promise((resolve, reject) => {
    exec(`sh bash.sh ${passFlags}`, (error, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
      if (error !== null) {
        console.log(`exec error: ${error}`);
        reject(error);
      }
      resolve(stdout);
    });
  });
};

module.exports = { clone };

clone({
  project: "expressmongo",
  url:
    "https://d1cfcd9e6ee418a96eb8c8a54d67e17aa8e9ab1b:x-oauth-basic@github.com/mkhizeryounas/express-mongo",
  path: base_dir,
  port: "3010",
  build: "npm install",
  script: "./bin/www",
  env: {
    NODE_ENV: "production"
  }
});
