const router = require("express").Router()
const verifyToken = require("../middleware/verifyToken")
const upload = require("../middleware/upload")
const { createLeaveRequest, updateLeaveRequest, submitLeaveRequest, approveLeaveRequest, rejectLeaveRequest, cancelLeaveRequest, getAllLeaveRequests, getLeaveRequestById, downloadLeaveDocument, deleteLeaveRequest } = require("../controllers/leaverequest.controller")

// Accept one optional file named "document" when creating a leave request.
router.post("/", verifyToken, upload.single("document"), createLeaveRequest)

// A draft can also receive a new document while it is being edited.
router.put('/:id', verifyToken, upload.single("document"), updateLeaveRequest)
router.put('/:id/submit', verifyToken, submitLeaveRequest)
router.put('/:id/approve', verifyToken, approveLeaveRequest)
router.put('/:id/reject', verifyToken, rejectLeaveRequest)
router.put('/:id/cancel', verifyToken, cancelLeaveRequest)
router.get('/', verifyToken, getAllLeaveRequests)

// Serve an attachment only after checking that the current user may view it.
router.get('/:id/document', verifyToken, downloadLeaveDocument)
router.get('/:id', verifyToken, getLeaveRequestById)
router.delete('/:id', verifyToken, deleteLeaveRequest)


module.exports = router
