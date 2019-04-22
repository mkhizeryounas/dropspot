const mongoose = require("mongoose");

var deploymentSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Types.ObjectId,
      ref: "Project",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Deployment", deploymentSchema);
