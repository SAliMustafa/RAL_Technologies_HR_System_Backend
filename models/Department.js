const mongoose = require('mongoose')

const departmentSchema = new mongoose.Schema(
    {
        company_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: true
        },
        name: {
            type: String,
            uppercase: true,
            required: true,
            trim: true
        },
        code: {
            type: String,
            trim: true,
            uppercase: true 
        },
        manager_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee'
        },
        is_active: {
            type: Boolean,
            default: true
        }
    },
    {timestamps: true}
)

departmentSchema.index({company_id: 1, name: 1}, {unique: true})

const Department = mongoose.model('Department', departmentSchema)
module.exports = Department