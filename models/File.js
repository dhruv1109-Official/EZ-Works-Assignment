const mongoose = require("mongoose");
const uuid = require("short-uuid");
const FileSchema = mongoose.Schema({
  fileId: { type: String, default: uuid.generate() },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const fileDetails = mongoose.model("File", FileSchema);

module.exports = fileDetails;
