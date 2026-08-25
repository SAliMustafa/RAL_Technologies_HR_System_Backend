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
        employer_sio_number: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            trim: true,
            lowercase: true
        },
        phone: {
            type: String,
            trim: true
        },
        address: {
            type: String,
            trim: true
        },
        currency: {
            type: String,
            default: 'BHD',
            required: true,
            uppercase: true,
            trim: true
        },
        is_active: {
            type: Boolean,
            default: true
        }
    },
    {timestamps: true}
)

const Company = mongoose.model('Company', companySchema)
module.exports = Company