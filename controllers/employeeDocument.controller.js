const EmployeeDocument = require("../models/EmployeeDocument")
const Employee = require("../models/Employee")
const AuditLog = require("../models/AuditLog")


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


async function getMyDocuments(req, res) {
  try {
    const employee_id = req.user._id
    const getMyDocument = await EmployeeDocument.find({ employee_id })
    res.status(200).json(getMyDocument);

  } catch (error) {
    res.status(500).json({ message: err.message });
  }

}

async function getDocumentById(req, res) {
  try {
    const documentId = req.params.documentId

    const findDocument = await EmployeeDocument.findById(documentId)
    res.status(200).json(findDocument);

  } catch (error) {
    res.status(500).json({ message: err.message });
  }
}


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

async function updateDocumentByHrAdmain(req, res) {
  try {
   
    const documentId = req.params.documentId
   
    const findDocument = await EmployeeDocument.findById(documentId)

    if (!findDocument) {
      return res.status(404).json({
        message: "Document not found"
      });
    }
    
    const uploaded_by = req.user._id
    const verified_by = req.user._id
    const file = req.file
    const { document_type, issue_date, expiry_date } = req.body;

    if (!file || !document_type) {
      return res.status(400).json({ message: "Missing required fields" });
    }



    const uploadOneDocument = await EmployeeDocument.findByIdAndUpdate(documentId,{
      document_type,
      issue_date,
      expiry_date,
      file: file.path,
      uploaded_by,
      status: "verified",
      verified_by,
      verified_on: new Date()
    },{
      new: true,
      runValidators: true
    });

    await AuditLog.insertMany([
      {
        table_name: "EmployeeDocument",
        record_id: uploadOneDocument._id.toString(),
        action: "update",
        changed_by: uploaded_by,
        field_name: "document_type",
        old_value: null,
        new_value: findDocument.document_type
        , ip_address: req.ip,
      },

      {
        table_name: "EmployeeDocument",
        record_id: uploadOneDocument._id.toString(),
        action: "update",
        changed_by: uploaded_by,
        field_name: "issue_date",
        old_value: findDocument.issue_date || "",
        new_value: issue_date || ""
        , ip_address: req.ip,
      },
      {
        table_name: "EmployeeDocument",
        record_id: uploadOneDocument._id.toString(),
        action: "update",
        changed_by: uploaded_by,
        field_name: "expiry_date",
        old_value: findDocument.expiry_date || "" ,
        new_value: expiry_date || ""
        , ip_address: req.ip,
      },
       {
        table_name: "EmployeeDocument",
        record_id: uploadOneDocument._id.toString(),
        action: "update",
        changed_by: uploaded_by,
        field_name: "file",
        old_value: findDocument.file  ,
        new_value:  file.path 
        , ip_address: req.ip,
      },
       {
        table_name: "EmployeeDocument",
        record_id: uploadOneDocument._id.toString(),
        action: "update",
        changed_by: uploaded_by,
        field_name: "status",
        old_value: findDocument.status  ,
        new_value:  "verified"
        , ip_address: req.ip,
      },
       {
        table_name: "EmployeeDocument",
        record_id: uploadOneDocument._id.toString(),
        action: "update",
        changed_by: uploaded_by,
        field_name: "status",
        old_value: findDocument.verified_by  ,
        new_value:  verified_by
        , ip_address: req.ip,
      },
        {
        table_name: "EmployeeDocument",
        record_id: uploadOneDocument._id.toString(),
        action: "update",
        changed_by: uploaded_by,
        field_name: "status",
        old_value: findDocument.verified_on  ,
        new_value:  new Date()
        , ip_address: req.ip,
      },


    ]);


    res.status(201).json(uploadOneDocument);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}



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

      changed_by,

      field_name: "status",

      old_value: oldDocument.status,

      new_value: updatedDocument.status,

      reason: status === "rejected" ? rejection_reason : "Document verified by HR",

      ip_address: req.ip
    });


  } catch (error) {
    res.status(500).json({ message: error.message });
  }

}



async function getExpiringDocuments() {
  try {

  } catch (error) {
    res.status(500).json({ message: err.message });
  }
}

async function checkDocumentExpiry() {
  try {

  } catch (error) {
    res.status(500).json({ message: err.message });
  }
}

async function sendExpiryAlerts() {
  try {

  } catch (error) {
    res.status(500).json({ message: err.message });
  }
}

async function deleteDocument() {
  try {

  } catch (error) {
    res.status(500).json({ message: err.message });
  }
}


module.exports = {
  uploadDocumentByEmployee, updateDocumentByEmployee, getMyDocuments, getDocumentById, uploadDocumentByHrAdmain

}