const mongoose = require("mongoose");
const { isURL } = require("validator");

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
    branch: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Project", projectSchema);
