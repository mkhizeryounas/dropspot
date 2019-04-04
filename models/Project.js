const mongoose = require("mongoose");
const { isURL } = require("validator");
const uuid = require("uuid/v4");
const { base_dir } = require("../config/keys");
const { toLower } = require("../src/modules/common");

var projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      set: toLower
    },
    github_repo: {
      type: String,
      required: true,
      validate: [isURL]
    },
    trigger_branch: {
      type: String,
      default: "master"
    },
    token: {
      type: String,
      default: uuid()
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true
    },
    language: {
      type: String,
      required: true,
      enum: ["nodejs", "php"]
    },
    path: {
      type: String,
      default: base_dir
    },
    build: {
      type: String,
      default: ""
    },
    script: {
      type: String,
      default: ""
    },
    env: {
      type: Object,
      default: {}
    },
    status: {
      type: String,
      default: "active",
      enum: ["active", "inActive", "inProgress"]
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Project", projectSchema);
