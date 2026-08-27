const router = require("express").Router()
const verifyToken = require('../middleware/verifyToken')
const verifyRole = require('../middleware/verifyRole')
const DocumentController = require('../controllers/employeeDocument.controller')
const upload = require("../middleware/uploadMiddleware");



router.post( "/documents",upload.single("file"),DocumentController.uploadDocumentByEmployee);


router.put( "/documents/:documentId",verifyUser,upload.single("file"),DocumentController);







module.exports = router
