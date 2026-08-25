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
        code: {
            type: String,
            trim: true,
            uppercase: true
        },
        department_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department'
        },
        description: {
            type: String,
            trim: true
        },
        is_active: {
            type: Boolean,
            default: true
        }
    },
    {timestamps: true}
)

designationSchema.index( {company_id: 1, title: 1}, {unique: true})

const Designation = mongoose.model('Designation', designationSchema)
module.exports = Designation