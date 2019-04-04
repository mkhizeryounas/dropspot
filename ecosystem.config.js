module.exports = {
  apps: [
    {
      name: "dropspot",
      script: "./www/bin",
      env: {
        NODE_ENV: "production",
        PORT: "8080"
      }
    }
  ]
};
