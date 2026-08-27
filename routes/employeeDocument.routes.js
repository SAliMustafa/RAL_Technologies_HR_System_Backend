const router = require("express").Router()
const verifyToken = require('../middleware/verifyToken')
const verifyRole = require('../middleware/verifyRole')
const DocumentController = require('../controllers/employeeDocument.controller')
const upload = require("../middleware/uploadMiddleware");


// Routes  Employee
router.post( "/",upload.single("file"),verifyRole.verifyEmployee,DocumentController.uploadDocumentByEmployee);

router.get( "/my-documents",verifyUser,verifyRole.verifyEmployee,DocumentController.getMyDocuments);

router.put( "/:documentId",verifyUser,verifyRole.verifyEmployee,upload.single("file"),DocumentController.updateDocumentByEmployee);

router.get( "/status/expiring",verifyUser,verifyRole.verifyEmployee,DocumentController.getExpiryAlerts);



// Routes Hr-Admin

router.get( "/",verifyUser,verifyRole.verifyHrAdmin,DocumentController.getAllDocuments);

router.post("/employee/:employeeId",verifyUser,upload.single("file"),verifyRole.verifyHrAdmin,DocumentController.uploadDocumentByHrAdmain);

router.put( "/hr/:documentId",verifyUser,upload.single("file"),verifyRole.verifyHrAdmin,DocumentController.updateDocumentByHrAdmain);

router.put("/:documentId/review",verifyUser,verifyRole.verifyHrAdmin,DocumentController.reviewDocument);

router.put("/delete",verifyUser,verifyRole.verifyHrAdmin,DocumentController.deleteDocument);


// route SHARED 
router.get( "/:documentId",verifyUser,DocumentController.getDocumentById);


module.exports = router
