var jwt = require("jsonwebtoken");
const common = require("./common");
const cert = require("../../config/keys").secret;
const { User } = require("../../config/models");

let data = {
  unlock: (request, response, next) => {
    let authHeader = request.headers["authorization"] || "";
    if (typeof authHeader !== "undefined" && authHeader.includes("Bearer ")) {
      authHeader = authHeader.substring(7);
      jwt.verify(authHeader, cert, async (err, decode) => {
        try {
          // GET URI FOR SCOPE CHECKING
          // console.log("req.originalUrl", request.originalUrl);
          if (err) throw authHeader;
          let _user = await User.findById(decode._id);
          if (!_user) throw authHeader;
          request.user = _user.toJSON();
          next();
        } catch (error) {
          response.reply({ statusCode: 401 });
        }
      });
    } else {
      response.reply({ statusCode: 401 });
    }
  },
  lock: obj => {
    obj = common.parse(obj);
    obj["iat"] = common.time();
    obj["exp"] = common.time() + 60 * 60 * 24;
    obj["access_token"] = jwt.sign(obj, cert);
    return obj;
  }
};

module.exports = data;
