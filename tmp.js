module.exports = {
  apps: [
    {
      name: "expressmongo1333",
      script: "./bin/www",
      env: {
        mongodb:
          "mongodb://mkhizeryounas:Mkhizer_321@ds121726.mlab.com:21726/shopdesk-oauth-test",
        PORT: "1122"
      }
    }
  ]
};
