const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  // limits: {
  //   fileSize: 3 * 1024 * 1024, // Maximum 3 MB
  // },
});

module.exports = upload;