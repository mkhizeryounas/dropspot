const http = require("request-promise");
const { base_url } = require("../../config/keys");

const create_hook = async (project, token, type) => {
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
        url: `${base_url}/${type}/${project._id}/webhook/${project.token}`,
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
