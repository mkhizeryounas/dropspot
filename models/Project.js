const mongoose = require("mongoose");
const { isURL } = require("validator");
const uuid = require("uuid/v4");

var projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    github_repo: {
      type: String,
      required: true,
      validate: [isURL]
    },
    trigger_branch: {
      type: String,
      required: true
    },
    token: {
      type: String,
      default: uuid()
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Project", projectSchema);
