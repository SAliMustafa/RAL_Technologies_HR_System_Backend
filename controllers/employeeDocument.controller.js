const EmployeeDocument =require("../models/EmployeeDocument")
const path = require("path")
const multer = require("multer")


const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../image/"))
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname)

    }
})

const upload = multer({ storage })


async function uploadDocumentByEmployee(req,res){
  try {        
         const employee_id=req.user._id 
         const uploaded_by=req.user._id  
         const status= "pending"
        const file =req.file
         if (!file || !document_type || !issue_date || !expiry_date ){
          res.status(404).json({"Message":"not found some Fileds"   })

         }

    const { document_type, issue_date, expiry_date} = req.body;
            
    const uploadOneDocument = await EmployeeDocument.create({
    document_type, issue_date, expiry_date,employee_id,uploaded_by,status
    }); 

    res.status(201).json(createdPet);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: err.message,
      });
    }
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Pet with this name already exists",
      });
    }
    res.status(500).json({ message: err.message });
  }
}


async function getEmployeeDocuments(params) {
  
}
async function getDocumentById(params) {
  
}
async function verifyDocument(params) {
  
}
async function rejectDocument(params) {
  
}
async function getExpiringDocuments(params) {
  
}
async function checkDocumentExpiry(params) {
  
}
async function sendExpiryAlerts (params) {
  
}
async function updateDocument (params) {
  
}
async function deleteDocument (params) {
  
}