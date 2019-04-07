const http = require("request-promise");
const { base_url } = require("../../config/keys");

const create_hook = async (project, token) => {
  try {
    let meta = project.github_repo;
    meta = meta.replace("https://github.com/", "");
    meta = meta.replace("https://www.github.com/", "");
    meta = meta.replace(".git", "");
    meta = meta.split("/");
    if (meta.length < 2) throw { status: 400 };
    let uri = `repos/${meta[0]}/${meta[1]}/hooks`;
    let body = {
      name: "web",
      active: true,
      events: ["push"],
      config: {
        url: `${base_url}/projects/${project._id}/webhook/${project.token}`,
        content_type: "json"
      }
    };
    console.log(`https://api.github.com/${uri}`);
    // return;
    let resp = await http({
      method: "post",
      uri: `https://api.github.com/${uri}`,
      body,
      json: true,
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github.symmetra-preview+json",
        "User-Agent": "Awesome-dropspot-CD"
      }
    });
    return resp;
  } catch (err) {
    console.log("Github Err", err);
    throw err;
  }
};

const list_hook = async (project, token) => {
  try {
    let meta = project.github_repo;
    meta = meta.replace("https://github.com/", "");
    meta = meta.replace("https://www.github.com/", "");
    meta = meta.replace(".git", "");
    meta = meta.split("/");
    if (meta.length < 2) throw { status: 400 };
    let uri = `repos/${meta[0]}/${meta[1]}/hooks`;

    let resp = await http({
      method: "get",
      uri: `https://api.github.com/${uri}`,
      json: true,
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github.symmetra-preview+json",
        "User-Agent": "Awesome-dropspot-CD"
      }
    });
    return resp;
  } catch (err) {
    console.log("Github Err", err);
    throw err;
  }
};

module.exports = { create_hook, list_hook };

// let gh = "d1cfcd9e6ee418a96eb8c8a54d67e17aa8e9ab1b";
// let data = {
//   _id: "5ca9fa170901aa2e0f8b14cd",
//   trigger_branch: "develop",
//   token: "f8766857-eefe-4043-96c0-a6ff53afff9a",
//   container: "3c21a155312e77d162d7ddfb6551c9bb3b1d1b5a4acde217ebb3d92cea4070d9",
//   build: "npm install",
//   script: "npm start",
//   env: [
//     'mongodb="mongodb://mkhizeryounas:Mkhizer_321@ds159737.mlab.com:59737/dropspot"'
//   ],
//   status: "active",
//   name: "expressmongo",
//   github_repo: "https://github.com/mkhizeryounas/express-mongo",
//   language: "nodejs",
//   user: "5ca67d1f992045048b382bae",
//   createdAt: "2019-04-07T13:24:39.558Z",
//   updatedAt: "2019-04-07T13:37:05.486Z",
//   __v: 0
// };

// create_hook(data, gh).then(res => console.log(res));
