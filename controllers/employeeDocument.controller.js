const EmployeeDocument = require("../models/EmployeeDocument")
const Employee = require("../models/Employee")
const AuditLog = require("../models/AuditLog")

// lets an employee upload their own document.
async function uploadDocumentByEmployee(req, res) {
  try {
    const employee_id = req.user._id
    const uploaded_by = req.user._id

    const file = req.file

    const { document_type, issue_date, expiry_date } = req.body;

    if (!file || !document_type) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const uploadOneDocument = await EmployeeDocument.create({
      employee_id,
      document_type,
      issue_date,
      expiry_date,
      file: file.path,
      uploaded_by,
      status: "pending"
    });

    res.status(201).json(uploadOneDocument);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
// lets an employee update or re-upload their own document.
async function updateDocumentByEmployee(req, res) {

  try {

    const employee_id = req.user._id
    const documentId = req.params.documentId
    const uploaded_by = req.user._id;

    const findDocument = await EmployeeDocument.findById(documentId)

    if (!findDocument) {
      return res.status(404).json({
        message: "Document not found"
      });
    }

    if (String(employee_id) != String(findDocument.employee_id)) {
      return res.status().json({ message: "Not allowed" });
    }

    const file = req.file
    const oldFile = findDocument.file;

    const { document_type, issue_date, expiry_date } = req.body;

    if (!file || !document_type) {
      return res.status(400).json({ message: "Missing required fields" });
    }


    const updateDocument = await EmployeeDocument.findByIdAndUpdate(documentId, {
      document_type,
      issue_date,
      expiry_date,
      file: file.path,
      uploaded_by,
      status: "pending"
    }, {
      new: true,
      runValidators: true
    });

    if (oldFile && fs.existsSync(oldFile)) {
      fs.unlinkSync(oldFile);
    }


    res.status(200).json(updateDocument);

  } catch (error) {
    res.status(500).json({ message: err.message });
  }
}

// gets all documents that belong to the logged-in employee.
async function getMyDocuments(req, res) {
  try {
    const employee_id = req.user._id
    const getMyDocument = await EmployeeDocument.find({ employee_id })
    res.status(200).json(getMyDocument);

  } catch (error) {
    res.status(500).json({ message: err.message });
  }

}

// gets all employee documents; only for HR-Admin.
async function getAllDocuments(req, res) {
  try {
    const getAllDocument = await EmployeeDocument.find().populate("employee_id")
    res.status(200).json(getAllDocument);

  } catch (error) {
    res.status(500).json({ message: err.message });
  }

}

// gets one specific document by its ID
async function getDocumentById(req, res) {
  try {
    const documentId = req.params.documentId

    const findDocument = await EmployeeDocument.findById(documentId).populate("employee_id")
    res.status(200).json(findDocument);

  } catch (error) {
    res.status(500).json({ message: err.message });
  }
}

// gets all employee documents; only for HR-Admin.
async function uploadDocumentByHrAdmain(req, res) {
  try {
    const employee_id = req.params.employeeId

    const employee = await Employee.findById(employee_id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const uploaded_by = req.user._id
    const verified_by = req.user._id

    const file = req.file

    const { document_type, issue_date, expiry_date } = req.body;

    if (!file || !document_type) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const uploadOneDocument = await EmployeeDocument.create({
      employee_id,
      document_type,
      issue_date,
      expiry_date,
      file: file.path,
      uploaded_by,
      status: "verified",
      verified_by,
      verified_on: new Date()
    });

    await AuditLog.insertMany([
      {
        table_name: "EmployeeDocument",
        record_id: uploadOneDocument._id.toString(),
        action: "create",
        changed_by: uploaded_by,
        field_name: "employee_id",
        old_value: null,
        new_value: employee_id.toString()
        , ip_address: req.ip,


      },

      {
        table_name: "EmployeeDocument",
        record_id: uploadOneDocument._id.toString(),
        action: "create",
        changed_by: uploaded_by,
        field_name: "document_type",
        old_value: null,
        new_value: document_type,
        ip_address: req.ip

      },

      {
        table_name: "EmployeeDocument",
        record_id: uploadOneDocument._id.toString(),
        action: "create",
        changed_by: uploaded_by,
        field_name: "issue_date",
        old_value: null,
        new_value: issue_date || "",
        ip_address: req.ip

      },

      {
        table_name: "EmployeeDocument",
        record_id: uploadOneDocument._id.toString(),
        action: "create",
        changed_by: uploaded_by,
        field_name: "expiry_date",
        old_value: null,
        new_value: expiry_date || ""
        , ip_address: req.ip


      },

      {
        table_name: "EmployeeDocument",
        record_id: uploadOneDocument._id.toString(),
        action: "create",
        changed_by: uploaded_by,
        field_name: "file",
        old_value: null,
        new_value: file.path,
        ip_address: req.ip

      },

      {
        table_name: "EmployeeDocument",
        record_id: uploadOneDocument._id.toString(),
        action: "create",
        changed_by: uploaded_by,
        field_name: "status",
        old_value: null,
        new_value: "verified",
        ip_address: req.ip

      }
    ]);


    res.status(201).json(uploadOneDocument);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
// lets HR-Admin update a specific employee document .
// async function updateDocumentByHrAdmain(req, res) {
//   try {

//     const documentId = req.params.documentId

//     const findDocument = await EmployeeDocument.findById(documentId)

//     if (!findDocument) {
//       return res.status(404).json({
//         message: "Document not found"
//       });
//     }

//     const uploaded_by = req.user._id
//     const verified_by = req.user._id
//     const file = req.file
//     const {
//       document_type,
//       issue_date,
//       expiry_date,
//       is_active
//     } = req.body;

//     if (!document_type) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }
//     let activeValue = findDocument.is_active;

//     if (is_active !== undefined) {

//       if (
//         is_active !== "true" &&
//         is_active !== "false" &&
//         is_active !== true &&
//         is_active !== false
//       ) {
//         return res.status(400).json({
//           message: "is_active must be true or false"
//         });
//       }

//       activeValue =
//         is_active === true ||
//         is_active === "true";
//     }




//     const verified_on = new Date();


//     const updateData = {
//       document_type,

//       issue_date:
//         issue_date || null,

//       expiry_date:
//         expiry_date || null,

//       is_active: activeValue,

//       status: "verified",

//       verified_by,

//       verified_on
//     };


//     // only replace file if HR uploaded a new one
//     if (file) {
//       updateData.file = file.path;
//     }


//     const updatedDocument =
//       await EmployeeDocument.findByIdAndUpdate(
//         documentId,
//         updateData,
//         {
//           new: true,
//           runValidators: true
//         }
//       );

//     await AuditLog.insertMany([
//       {
//         table_name: "EmployeeDocument",
//         record_id: uploadOneDocument._id.toString(),
//         action: "update",
//         changed_by: uploaded_by,
//         field_name: "document_type",
//         old_value: null,
//         new_value: findDocument.document_type
//         , ip_address: req.ip,
//       },

//       {
//         table_name: "EmployeeDocument",
//         record_id: uploadOneDocument._id.toString(),
//         action: "update",
//         changed_by: uploaded_by,
//         field_name: "issue_date",
//         old_value: findDocument.issue_date || "",
//         new_value: issue_date || ""
//         , ip_address: req.ip,
//       },
//       {
//         table_name: "EmployeeDocument",
//         record_id: uploadOneDocument._id.toString(),
//         action: "update",
//         changed_by: uploaded_by,
//         field_name: "expiry_date",
//         old_value: findDocument.expiry_date || "",
//         new_value: expiry_date || ""
//         , ip_address: req.ip,
//       },
//       {
//         table_name: "EmployeeDocument",
//         record_id: uploadOneDocument._id.toString(),
//         action: "update",
//         changed_by: uploaded_by,
//         field_name: "file",
//         old_value: findDocument.file,
//         new_value: file.path
//         , ip_address: req.ip,
//       },
//       {
//         table_name: "EmployeeDocument",
//         record_id: uploadOneDocument._id.toString(),
//         action: "update",
//         changed_by: uploaded_by,
//         field_name: "status",
//         old_value: findDocument.status,
//         new_value: "verified"
//         , ip_address: req.ip,
//       },
//       {
//         table_name: "EmployeeDocument",
//         record_id: uploadOneDocument._id.toString(),
//         action: "update",
//         changed_by: uploaded_by,
//         field_name: "verified_by",
//         old_value: findDocument.verified_by,
//         new_value: verified_by
//         , ip_address: req.ip,
//       },
//       {
//         table_name: "EmployeeDocument",
//         record_id: uploadOneDocument._id.toString(),
//         action: "update",
//         changed_by: uploaded_by,
//         field_name: "verified_on",
//         old_value: findDocument.verified_on,
//         new_value: new Date()
//         , ip_address: req.ip,
//       },


//     ]);


//     res.status(201).json(uploadOneDocument);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// }
async function updateDocumentByHrAdmain(req, res) {
  try {

    const documentId = req.params.documentId;

    const findDocument = await EmployeeDocument.findById(documentId);

    if (!findDocument) {
      return res.status(404).json({
        message: "Document not found"
      });
    }


    const changed_by = req.user._id;
    const verified_by = req.user._id;
    const file = req.file;

    const {
      document_type,
      issue_date,
      expiry_date,
      is_active
    } = req.body;


    if (!document_type) {
      return res.status(400).json({
        message: "Document type is required"
      });
    }


    // ============================
    // Handle is_active
    // ============================

    let activeValue = findDocument.is_active;

    if (is_active !== undefined) {

      if (
        is_active !== "true" &&
        is_active !== "false" &&
        is_active !== true &&
        is_active !== false
      ) {
        return res.status(400).json({
          message: "is_active must be true or false"
        });
      }

      activeValue =
        is_active === true ||
        is_active === "true";
    }


    const verified_on = new Date();


    // ============================
    // Update Data
    // ============================

    const updateData = {

      document_type,

      issue_date:
        issue_date || null,

      expiry_date:
        expiry_date || null,

      is_active: activeValue,

      status: "verified",

      verified_by,

      verified_on
    };


    // Replace file only if new file uploaded
    if (file) {
      updateData.file = file.path;
    }


    const updatedDocument =
      await EmployeeDocument.findByIdAndUpdate(
        documentId,
        updateData,
        {
          new: true,
          runValidators: true
        }
      );


    // ============================
    // AUDIT LOG
    // ============================

    const auditLogs = [];


    // Document Type
    if (
      findDocument.document_type !==
      updatedDocument.document_type
    ) {
      auditLogs.push({
        table_name: "EmployeeDocument",

        record_id:
          updatedDocument._id.toString(),

        action: "update",

        changed_by,

        field_name: "document_type",

        old_value:
          findDocument.document_type,

        new_value:
          updatedDocument.document_type,

        ip_address: req.ip
      });
    }


    // Issue Date
    if (
      String(findDocument.issue_date || "") !==
      String(updatedDocument.issue_date || "")
    ) {
      auditLogs.push({
        table_name: "EmployeeDocument",

        record_id:
          updatedDocument._id.toString(),

        action: "update",

        changed_by,

        field_name: "issue_date",

        old_value:
          findDocument.issue_date || "",

        new_value:
          updatedDocument.issue_date || "",

        ip_address: req.ip
      });
    }


    // Expiry Date
    if (
      String(findDocument.expiry_date || "") !==
      String(updatedDocument.expiry_date || "")
    ) {
      auditLogs.push({
        table_name: "EmployeeDocument",

        record_id:
          updatedDocument._id.toString(),

        action: "update",

        changed_by,

        field_name: "expiry_date",

        old_value:
          findDocument.expiry_date || "",

        new_value:
          updatedDocument.expiry_date || "",

        ip_address: req.ip
      });
    }


    // Active / Inactive
    if (
      findDocument.is_active !==
      updatedDocument.is_active
    ) {
      auditLogs.push({
        table_name: "EmployeeDocument",

        record_id:
          updatedDocument._id.toString(),

        action: "update",

        changed_by,

        field_name: "is_active",

        old_value:
          findDocument.is_active,

        new_value:
          updatedDocument.is_active,

        ip_address: req.ip
      });
    }


    // File
    if (
      file &&
      findDocument.file !== updatedDocument.file
    ) {
      auditLogs.push({
        table_name: "EmployeeDocument",

        record_id:
          updatedDocument._id.toString(),

        action: "update",

        changed_by,

        field_name: "file",

        old_value:
          findDocument.file,

        new_value:
          updatedDocument.file,

        ip_address: req.ip
      });
    }


    // Status
    if (
      findDocument.status !==
      updatedDocument.status
    ) {
      auditLogs.push({
        table_name: "EmployeeDocument",

        record_id:
          updatedDocument._id.toString(),

        action: "update",

        changed_by,

        field_name: "status",

        old_value:
          findDocument.status,

        new_value:
          updatedDocument.status,

        ip_address: req.ip
      });
    }


    // Verified By
    if (
      String(findDocument.verified_by || "") !==
      String(updatedDocument.verified_by || "")
    ) {
      auditLogs.push({
        table_name: "EmployeeDocument",

        record_id:
          updatedDocument._id.toString(),

        action: "update",

        changed_by,

        field_name: "verified_by",

        old_value:
          findDocument.verified_by || "",

        new_value:
          updatedDocument.verified_by || "",

        ip_address: req.ip
      });
    }


    // Verified On
    auditLogs.push({
      table_name: "EmployeeDocument",

      record_id:
        updatedDocument._id.toString(),

      action: "update",

      changed_by,

      field_name: "verified_on",

      old_value:
        findDocument.verified_on || "",

      new_value:
        updatedDocument.verified_on,

      ip_address: req.ip
    });


    // Save audit only if there are changes
    if (auditLogs.length > 0) {
      await AuditLog.insertMany(auditLogs);
    }


    return res.status(200).json({
      message: "Document updated successfully",
      document: updatedDocument
    });

  } catch (err) {

    console.log(err);

    return res.status(500).json({
      message: err.message
    });

  }
}

// lets HR-Admin review a pending document and either verify it or reject it with a reason.
async function reviewDocument(req, res) {
  try {

    const documentId = req.params.documentId
    const verified_by = req.user._id

    const oldDocument = await EmployeeDocument.findById(documentId);

    if (!oldDocument) {
      return res.status(404).json({
        message: "Document not found"
      });
    }

    const { status, rejection_reason } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "Status must be verified or rejected"
      });
    }

    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be verified or rejected"
      });
    }

    if (status === "rejected" && !rejection_reason) {
      return res.status(400).json({
        message: "Rejection reason is required"
      });
    }

    let updateData = {};

    if (status === "verified") {
      updateData = {
        status: "verified",
        verified_by,
        verified_on: new Date()
      };
    }

    if (status === "rejected") {
      updateData = {
        status: "rejected",
        verified_by,
        rejection_reason
      };
    }

    const updatedDocument = await EmployeeDocument.findByIdAndUpdate(
      documentId,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );


    await AuditLog.create({
      table_name: "EmployeeDocument",
      record_id: documentId.toString(),

      action: status === "verified" ? "approve" : "update",

      changed_by: verified_by,

      field_name: "status",

      old_value: oldDocument.status,

      new_value: updatedDocument.status,

      reason: status === "rejected" ? rejection_reason : "Document verified by HR",

      ip_address: req.ip
    });

    return res.status(200).json({
      message:
        status === "verified"
          ? "Document verified successfully"
          : "Document rejected successfully",
      document: updatedDocument
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

}


// checks the logged-in employee’s verified documents and returns alerts for documents close to expiry.
async function getExpiryAlerts(req, res) {
  try {
    const employee_id = req.user._id;

    const documents = await EmployeeDocument.find({
      employee_id,
      // status: "verified",
      expiry_date: { $ne: null }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const alertDays = [90, 30, 7];

    const alerts = [];

    for (const document of documents) {

      const expiryDate = new Date(document.expiry_date);
      expiryDate.setHours(0, 0, 0, 0);

      const difference = expiryDate - today;

      const daysRemaining = Math.ceil(
        difference / (1000 * 60 * 60 * 24)
      );

      if (alertDays.includes(daysRemaining)) {

        alerts.push({
          document_type: document.document_type,
          daysRemaining,
          message:
            `Your ${document.document_type} will expire in ${daysRemaining} days`
        });

      }
    }

    return res.status(200).json(alerts);

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}
//  lets HR-Admin change  is_actavite to False 
async function deleteDocument(req, res) {
  try {
    const changed_by = req.user._id
    const documentId = req.params.documentId

    const findDocument = await EmployeeDocument.findById(documentId)

    if (!findDocument) {
      return res.status(404).json({
        message: "Document not found"
      });
    }
    const deleteDocument = await EmployeeDocument.findByIdAndUpdate(documentId, {
      is_active: false
    }, {
      new: true,
      runValidators: true
    });

    await AuditLog.insertMany(
      {
        table_name: "EmployeeDocument",
        record_id: deleteDocument._id.toString(),
        action: "delete",
        changed_by: changed_by,
        field_name: "is_active",
        old_value: true,
        new_value: false,
        reason: "Document deactivated by HR",
        ip_address: req.ip,
      })



    res.status(200).json({ message: "Document deactivated by HR" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


module.exports = {
  uploadDocumentByEmployee, updateDocumentByEmployee, getMyDocuments, getDocumentById, uploadDocumentByHrAdmain, deleteDocument, getAllDocuments, getExpiryAlerts, reviewDocument, updateDocumentByHrAdmain

}