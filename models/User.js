const mongoose = require("mongoose");
const common = require("../src/modules/common");

const toLower = str => str.toLowerCase();

var userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      dropDups: true,
      set: toLower
    },
    password: { type: String, required: true, set: common.hash },
    github_token: { type: String, required: true }
  },
  {
    timestamps: true
  }
);

userSchema.methods.toJSON = function() {
  var obj = this.toObject();
  delete obj.password;
  return obj;
};

userSchema.methods.checkPassword = async function(password) {
  if (common.hash(password) === this.password) {
    return this;
  }
  throw { status: 401 };
};

module.exports = mongoose.model("User", userSchema);
