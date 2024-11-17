const express = require("express");
const {
  signup,
  verify,
  login,
  listFiles,
  downloadFile,
  DencryptDownloadLink,
  encryptedDownloadLink,
} = require("../controllers/clientController");
const { auth } = require("../auth");
const router = express.Router();

router.post("/signup", signup);
router.get("/verify", verify);
router.post("/login", login);
router.get(
  "/downloadLink/:fileId",
  auth("client"),
  encryptedDownloadLink
);
router.get("/decrypt", auth("client"), DencryptDownloadLink);
router.get("/download/:fileId", downloadFile);
router.get("/allFiles", auth("client"), listFiles);
module.exports = router;
