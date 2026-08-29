const mongoose = require('mongoose')

const departmentSchema = new mongoose.Schema(
    {
        
        name: {
            type: String,
            uppercase: true,
            required: true,
            trim: true
        },
        manager_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee'
        },
    },
    {timestamps: true}
)

departmentSchema.index({company_id: 1, name: 1}, {unique: true})

const Department = mongoose.model('Department', departmentSchema)
module.exports = Department