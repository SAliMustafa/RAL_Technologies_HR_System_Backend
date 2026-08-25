const mongoose = require('mongoose')

const designationSchema = new mongoose.Schema(
    {
        company_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        
    },
    {timestamps: true}
)

designationSchema.index( {company_id: 1, title: 1}, {unique: true})

const Designation = mongoose.model('Designation', designationSchema)
module.exports = Designation