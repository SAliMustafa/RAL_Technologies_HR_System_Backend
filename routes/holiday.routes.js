const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken")
const validateObjectId = require("../middleware/validateObjectId")
const { verifyHrAdmin } = require("../middleware/verifyRole")
const holidayController = require("../controllers/holiday.controller")

router.post("/", verifyToken, verifyHrAdmin, holidayController.createHoliday)

router.get("/", verifyToken, holidayController.getHolidays)

router.get("/:id", verifyToken, validateObjectId, holidayController.getHolidayById)

router.put("/:id", verifyToken, verifyHrAdmin, validateObjectId, holidayController.updateHoliday)

router.delete("/:id", verifyToken, verifyHrAdmin, validateObjectId, holidayController.deleteHoliday)

module.exports = router