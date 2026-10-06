const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  name: String,
  issue: String,
  location: String,
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Report", reportSchema);