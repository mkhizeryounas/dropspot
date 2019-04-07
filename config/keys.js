if (process.env.NODE_ENV === "production") require("dotenv").config();

module.exports = {
  mongodb: process.env.mongodb || "mongodb://localhost:27017/dropspot",
  secret: process.env.secret || "c6aSsUzQBACrdWoWy6g7BkuxwKfkPbmB",
  docker_sock: process.env.docker_sock || "/var/run/docker.sock",
  base_url: process.env.base_url || "http://localhost:3000"
};
