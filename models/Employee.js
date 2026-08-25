const mongoose = require("mongoose");

const CPR_REGEX = /^\d{9}$/

const MOBILE_REGEX = /^3\d{7}$/

const BH_IBAN_SHAPE_REGEX = /^BH\d{2}[A-Z]{4}[A-Z0-9]{14}$/

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function mod97(numericIban){
    let remainder = 0
    for (const digit of numericIban){
        remainder = (remainder * 10 + Number(digit)) % 97
    }
    return remainder
}

function isValidBahrainIban(rawIban){
    if(typeof rawIban !== 'string') return false
    const iban = rawIban.replace(/\s+/g, '').toUpperCase()

    if(iban.length !== 22) return false
    if(!BH_IBAN_SHAPE_REGEX.test(iban)) return false

    const rearranged = iban.slice(4) + iban.slice(0, 4)
    const numeric = rearranged
        .split('')
        .map((ch)=>{
            const code = ch.charCodeAt(0)
            return code >= 65 && code <= 90 ? String(code - 55) : ch
        })
        .join('')
    
        return mod97(numeric) === 1
}


const employeeSchema = new mongoose.Schema(
  {
    employee_code: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name_en: {
        type: String,
        required: true,
        trim: true
    },
    name_ar: {
        type: String,
        required: true,
        trim: true
    },
    cpr_number: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: (v) => CPR_REGEX.test(v),
            message: 'cpr_number must be exactly 9 digits'
        },
    },
    date_of_birth: {
        type: Date,
        required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ['male', 'female'],
    },
    nationality: {
        type: String,
        required: true,
        trim: true
    },
    is_bahraini: {
        type: Boolean,
        required: true
    },
    worker_category: {
        type: String,
        required: true,
        enum: ['bahraini', 'gcc_national', 'expatriate']
    },
    company_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    department_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Department' 
    },
    designation_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Designation' 
    },
    reports_to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    },
    date_of_joining: {
        type: Date,
        required: true
    },
    probation_end_date: {
        type: Date,
        validate: {
            validator: function(v){
                if(!v || !this.date_of_joining) return true
                const capMonths = this.probation_extended_with_consent ? 6 : 3
                const cap = new Date(this.date_of_joining)
                cap.setMonth(cap.getMonth()+capMonths)
                return v <= cap
            },
            message: 'probation_end_date exceeds the allowed 3 months (6 with written consent).'
        }
    },
    probation_extended_with_consent: { 
        type: Boolean, 
        default: false 
    },
    employment_type: {
        type: String,
        required: true,
        enum: ['full_time', 'part_time', 'fixed_term']
    },

    status: {
        type: String,
        required: true,
        enum: ['active', 'on_leave', 'suspended', 'left'],
        default: 'active'
    },
    date_of_leaving: {
        type: Date,
        validate: {
            validator: function(v){
                return this.status !== 'left' || v != null
            },
            message: 'date_of_leaving is required once status is "left".'
        }
    },
    iban: {
        type: String,
        required: true,
        set: (v)=> (typeof v === 'string' ? v.replace(/\s+/g, '').toUpperCase() : v),
        validate: {
            validator: isValidBahrainIban,
            message: 'iban is not a structurally valid Bahrain IBAN (shape or check digits failed).'
        },
    },
    bank_name: {
        type: String,
        trim: true,
        required: true
    },
    mobile: {
        type: String,
        required: true,
        validate: {
            validator: (v) => MOBILE_REGEX.test(v),
            message: 'mobile must be exactly 8 digits and start with 3.'
        }
    },
    email_personal: {
        type: String,
        lowercase: true,
        trim: true,
        validate: {
            validator: (v) => !v || EMAIL_REGEX.test(v),
            message: 'email_personal is not a valid email address'
        }
    },
    email_work: {
        type: String,
        lowercase: true,
        trim: true,
        validate: {
            validator: (v) => !v || EMAIL_REGEX.test(v),
            message: 'email_work is not a valid email address'
        }
    },
    holiday_list_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HolidayList',
        required: true
    },
    shift_type_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ShiftType'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
  },
  { timestamps: true }
);


const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;
