const multer = require("multer");

const storage = multer.memoryStorage(); // store file in memory

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
});

module.exports = upload;