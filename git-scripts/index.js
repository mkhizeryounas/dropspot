const exec = require("child_process").exec;

const clone = async arg => {
  try {
    let ecosystemFile = "";

    let passFlags = `
      cd ${arg.path}
      rm -rf ${arg.name}
      git clone ${arg.url} ${arg.name}
      cd ${arg.name}
      ${arg.build}
    `;

    // Supported Platforms Commands
    if (arg.language === "nodejs") {
      ecosystemFile = `module.exports = {
        apps: [
          {
            name: "${arg.name}",
            script: "${arg.script}",
            env: ${JSON.stringify(arg.env)}
          }
        ]
      };`;
      passFlags += `
        echo '${ecosystemFile}' >> ecosystem.config.js
        pm2 start ecosystem.config.js
      `;
    }
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

// clone({
//   name: "expressmongo",
//   language: "nodejs",
//   url:
//     "https://d1cfcd9e6ee418a96eb8c8a54d67e17aa8e9ab1b:x-oauth-basic@github.com/mkhizeryounas/express-mongo",
//   path: base_dir,
//   build: "npm install",
//   script: "./bin/www",
//   env: {
//     NODE_ENV: "production",
//     PORT: "3010"
//   }
// });
