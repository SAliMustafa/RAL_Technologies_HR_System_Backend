const mongoose = require('mongoose')

const companySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        cr_number: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
    },
    {timestamps: true}
)

const Company = mongoose.model('Company', companySchema)
module.exports = Company