const AuditLog = require("../models/AuditLog");
const mongoose=require("mongoose")

// ============================
// GET ALL AUDIT LOGS
// ============================

async function getAllAuditLogs(req, res) {
  try {
    const logs = await AuditLog.find()
      .populate("changed_by", "username role")
      .sort({ changed_at: -1 });

    return res.status(200).json(logs);

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}

// ============================
// GET AUDIT LOG DETAILS
// ============================


async function getAuditLogById(req, res) {
  try {

    const { auditLogId } = req.params;


    if (!mongoose.Types.ObjectId.isValid(auditLogId)) {
      return res.status(400).json({
        message: "Invalid audit log id"
      });
    }


    const log = await AuditLog.findById(auditLogId)
      .populate("changed_by", "username role");


    if (!log) {
      return res.status(404).json({
        message: "Audit log not found"
      });
    }


    return res.status(200).json(log);

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: error.message
    });
  }
}



// ============================
// GET HISTORY FOR ONE RECORD
// ============================

async function getAuditLogsByRecord(req, res) {
  try {

    const {
      tableName,
      recordId
    } = req.params;


    if (!tableName || !recordId) {
      return res.status(400).json({
        message: "Table name and record id are required"
      });
    }


    const logs = await AuditLog.find({
      table_name: tableName,
      record_id: recordId
    })
      .populate(
        "changed_by",
        "username role"
      )
      .sort({
        changed_at: -1
      });


    return res.status(200).json(logs);

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: error.message
    });
  }
}

module.exports = {
  getAllAuditLogs,
  getAuditLogById,
  getAuditLogsByRecord
};