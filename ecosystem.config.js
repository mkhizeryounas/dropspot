module.exports = {
  apps: [
    {
      name: "dropspot",
      script: "./bin/www",
      env: {
        NODE_ENV: "production",
        PORT: "8080"
      }
    }
  ]
};
