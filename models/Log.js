const mongoose = require("mongoose");

var logSchema = new mongoose.Schema(
  {
    deployment: {
      type: mongoose.Types.ObjectId,
      ref: "Deployment",
      required: true
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success"
    },
    message: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Log", logSchema);
