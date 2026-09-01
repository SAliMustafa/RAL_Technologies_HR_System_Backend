const router = require("express").Router()
const verifyToken = require('../middleware/verifyToken')
const verifyRole = require('../middleware/verifyRole')
const DocumentController = require('../controllers/employeeDocument.controller')
const upload = require("../middleware/upload");


// Routes  Employee
router.post( "/",verifyToken,upload.single("file"),verifyRole.verifyEmployee,DocumentController.uploadDocumentByEmployee);

router.get( "/my-documents",verifyToken,verifyRole.verifyEmployee,DocumentController.getMyDocuments);

// this uselee
router.put( "/:documentId",verifyToken,verifyRole.verifyEmployee,upload.single("file"),DocumentController.updateDocumentByEmployee);

router.get( "/status/expiring",verifyToken,verifyRole.verifyEmployee,DocumentController.getExpiryAlerts);



// Routes Hr-Admin

router.get( "/",verifyToken,verifyRole.verifyHrAdmin,DocumentController.getAllDocuments);

router.post("/employee/:employeeId",verifyToken,upload.single("file"),verifyRole.verifyHrAdmin,DocumentController.uploadDocumentByHrAdmain);

router.put( "/hr/:documentId",verifyToken,upload.single("file"),verifyRole.verifyHrAdmin,DocumentController.updateDocumentByHrAdmain);

router.put("/:documentId/review",verifyToken,verifyRole.verifyHrAdmin,DocumentController.reviewDocument);

router.put("/delete",verifyToken,verifyRole.verifyHrAdmin,DocumentController.deleteDocument);


// route SHARED 
router.get( "/:documentId",verifyToken,DocumentController.getDocumentById);


module.exports = router
