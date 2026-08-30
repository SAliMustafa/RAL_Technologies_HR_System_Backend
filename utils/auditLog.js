const AuditLog = require("../models/AuditLog")

async function logField({ tableName, recordId, action, userId, fieldName, oldValue, newValue, reason, ipAddress }) {
  try {
    await AuditLog.create({
      table_name: tableName,
      record_id: String(recordId),
      action,
      changed_by: userId,
      field_name: fieldName,
      old_value: oldValue === undefined || oldValue === null ? undefined : String(oldValue),
      new_value: newValue === undefined || newValue === null ? undefined : String(newValue),
      reason,
      ip_address: ipAddress
    });
  } catch (err) {
    // Audit logging must never break the actual operation it's logging.
    console.log("Audit log write failed:", err)
  }
}

async function logCreate({ tableName, recordId, userId, data, ipAddress }) {
  const fields = Object.keys(data || {});
  await Promise.all(
    fields.map((field) =>
      logField({
        tableName,
        recordId,
        action: "create",
        userId,
        fieldName: field,
        oldValue: null,
        newValue: data[field],
        ipAddress
      })
    )
  );
}

async function logUpdate({ tableName, recordId, userId, before, after, reason, ipAddress }) {
  const changedFields = Object.keys(after || {}).filter(
    (field) => String(before?.[field]) !== String(after[field])
  )

  await Promise.all(
    changedFields.map((field) =>
      logField({
        tableName,
        recordId,
        action: "update",
        userId,
        fieldName: field,
        oldValue: before?.[field],
        newValue: after[field],
        reason,
        ipAddress,
      })
    )
  )
}

async function logDelete({ tableName, recordId, userId, reason, ipAddress }) {
  await logField({
    tableName,
    recordId,
    action: "delete",
    userId,
    fieldName: "_record",
    oldValue: "exists",
    newValue: "deleted",
    reason,
    ipAddress
  })
}

module.exports = { logCreate, logUpdate, logDelete }