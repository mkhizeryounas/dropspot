const express = require("express");
const router = express.Router();
var http = require("request-promise");

let responseBuilder = (response, result) => {
  response.status(result.statusCode);
  response.set(result.headers);
  let err = result.error;
  try {
    err = JSON.parse(err);
  } catch (err) {}
  response.send(result.body || err);
};

/* GET home page. */
router.all("/:project/**", async function(request, response, next) {
  try {
    let originalUrl = request.originalUrl.split("/");
    if (originalUrl.length < 2) throw { status: 404 };

    let appName = originalUrl[2];
    let appUrl = originalUrl.slice(3).join("/");
    let port = 3010;

    console.log(appName, appUrl);

    http({
      method: request.method,
      uri: `http://localhost:${port}`,
      headers: request.headers,
      data: request.body,
      qs: request.query,
      formData: request.body,
      resolveWithFullResponse: true
    })
      .then(result => {
        responseBuilder(response, result);
      })
      .catch(result => {
        responseBuilder(response, result);
      });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
