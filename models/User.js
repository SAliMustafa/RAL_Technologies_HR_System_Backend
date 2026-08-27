const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase:true
    },
    hashedPassword: {
      type: String,
      required: true
    },
    role:{
      type:String,
      required:true,
      enum:["employee","manager","hr_admin"],
      default:"employee"
    },
    employeeId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      unique: true,
      sparse: true
    }
  },
  { timestamps: true },
);

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    delete returnedObject.hashedPassword;
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
