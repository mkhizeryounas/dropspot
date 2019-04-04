module.exports = {
  apps: [
    {
      name: "webpeer-platform",
      script: "./app.js",
      env: {
        NODE_ENV: "production",
        PORT: "3010"
      }
    }
  ]
};
