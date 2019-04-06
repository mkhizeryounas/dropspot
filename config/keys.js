if (process.env.NODE_ENV === "production") require("dotenv").config();
console.log("mongodb", process.env.mongodb);
module.exports = {
  mongodb: process.env.mongodb || "mongodb://localhost:27017/dropspot",
  secret: process.env.secret || "c6aSsUzQBACrdWoWy6g7BkuxwKfkPbmB",
  base_dir:
    process.env.base_dir ||
    "/Users/mkhizeryounas/Desktop/Projects/web/__DROPSPOT_PROJRCTS__/",
  docker_sock: process.env.base_dir || "/var/run/docker.sock"
};
