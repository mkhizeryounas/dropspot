var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", async function(req, res, next) {
  res.reply({ data: { title: "Dropspot CD Platform" } });
});

module.exports = router;
