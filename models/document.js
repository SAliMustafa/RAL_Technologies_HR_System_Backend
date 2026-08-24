const mongoose = require('mongoose')

const documentSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    documentType: {
        type: String,
        enum: ['CPR', 'Passport', 'Work Permit', 'Professional Licence'],
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    isArchived: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

module.exports = mongoose.model('Document', documentSchema)