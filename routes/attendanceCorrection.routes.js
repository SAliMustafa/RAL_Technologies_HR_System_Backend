const router = require("express").Router()
const verifyToken = require("../middleware/verifyToken")
const validateObjectId = require("../middleware/validateObjectId")
const { verifyManager, verifyHrAdmin } = require("../middleware/verifyRole")
const correctionController = require("../controllers/attendanceCorrection.controller")

router.post("/", verifyToken, verifyManager, correctionController.createCorrectionRequest)
router.get("/", verifyToken, correctionController.getCorrectionRequests)
router.get("/:id", verifyToken, validateObjectId, correctionController.getCorrectionById)
router.put("/:id/correct", verifyToken, verifyHrAdmin, validateObjectId, correctionController.correctByHr)
router.put("/:id/approve", verifyToken, verifyManager, validateObjectId, correctionController.approveCorrection)
router.put("/:id/reject", verifyToken, validateObjectId, correctionController.rejectCorrection)

module.exports = router