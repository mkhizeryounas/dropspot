const express = require("express");
const router = express.Router();
var http = require("http");

/* GET home page. */
router.all("/:project/**", async function(request, response, next) {
  try {
    let originalUrl = request.originalUrl.split("/");
    if (originalUrl.length < 2) throw { status: 404 };

    let appName = originalUrl[2];
    let appUrl = originalUrl.slice(3).join("/");

    let options = {
      hostname: "localhost",
      port: 3010,
      path: `/${appUrl}`,
      method: request.method,
      headers: request.headers,
      body: request.body
    };
    var proxy = http.request(options, function(res) {
      response.writeHead(res.statusCode, res.headers);
      res.pipe(
        response,
        {
          end: true
        }
      );
    });

    request.pipe(
      proxy,
      {
        end: true
      }
    );

    console.log(appName, appUrl);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
