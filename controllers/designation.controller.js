const Designation = require('../models/Designation')

async function getDesignation(req,res){
    try{
        const 
    }catch(err){
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: err.message })
        }
        if (err.code === 11000) {
            return res.status(409).json({
                message: 'A designation with this name already exists for this company.'
            })
        }
        return res.status(500).json({ message: 'Internal Server Error' })    }
}


module.exports = {
    
}