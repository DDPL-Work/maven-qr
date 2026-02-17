const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: ["STANDARD", "PREMIUM", "ELITE"],
      unique: true,
    },

    jobLimit: { type: Number, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Package", packageSchema);
