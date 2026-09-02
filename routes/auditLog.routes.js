const router = require("express").Router()
const verifyToken = require("../middleware/verifyToken")
const validateObjectId = require("../middleware/validateObjectId")
const verifyRole = require("../middleware/verifyRole")
const AuditLogController = require("../controllers/auditLog")


router.get(
  "/",
  verifyToken,
  verifyRole.verifyHrAdmin,
  AuditLogController.getAllAuditLogs
);

router.get(
  "/:auditLogId",
  verifyToken,
  verifyRole.verifyHrAdmin,
  AuditLogController.getAuditLogById
);

router.get(
  "/record/:tableName/:recordId",
  verifyToken,
  verifyRole.verifyHrAdmin,
  AuditLogController.getAuditLogsByRecord
);


module.exports = router