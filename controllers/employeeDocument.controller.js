const EmployeeDocument = require("../models/EmployeeDocument")
const Employee = require("../models/Employee")


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
    
    const updatedDocument =await EmployeeDocument.findByIdAndUpdate(
        documentId,
        updateData,
        {
          new: true,
          runValidators: true
        }
      );


  } catch (error) {
    res.status(500).json({ message: err.message });
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