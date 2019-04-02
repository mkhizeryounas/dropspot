const exec = require("child_process").exec;
const clone = arg => {
  const passFlags = `
  kill-port ${arg.port}
  cd ${arg.path}
  rm -rf ${arg.project}
  git clone ${arg.url} ${arg.project}
  cd ${arg.project}
  ${arg.build}
  ${arg.run}
  `;
  exec(`sh scripts/clone.sh ${passFlags}`, (error, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    if (error !== null) {
      console.log(`exec error: ${error}`);
    }
  });
};

module.exports = { clone };

clone({
  project: "expressmongo",
  url:
    "https://d1cfcd9e6ee418a96eb8c8a54d67e17aa8e9ab1b:x-oauth-basic@github.com/mkhizeryounas/express-mongo",
  path: `${process.cwd()}/__builds__/`,
  build: "npm i",
  run: "PORT=3010 npm run dev",
  port: "3010"
});
