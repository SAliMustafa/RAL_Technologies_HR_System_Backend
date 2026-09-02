const User = require("../models/User");

async function verifyHrAdmin(req, res, next) {
  try {
    const user = await User.findById(req.user._id)
    console.log("req.user:", req.user);
    console.log("Database user:", user);
    console.log("User role:", user?.role);
    if (!user) {
      return res.status(404).json({
        message: "User not found."
      })
    } else if (user.role !== "hr_admin") {
      return res.status(403).json({
        message: "This is not within your authority."
      })
    }

    next()

  } catch (err) {
    console.error(err)

    return res.status(500).json({
      message: "Internal Server Error"
    })
  }
}

async function verifyManager(req, res, next) {
  try {
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      })
    } else if (user.role !== "manager") {
      return res.status(403).json({
        message: "This is not within your authority."
      })
    }

    next()

  } catch (err) {
    console.error(err)

    return res.status(500).json({
      message: "Internal Server Error"
    })
  }
}


async function verifyEmployee(req, res, next) {
  try {
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      })
    } else if (user.role !== "employee") {
      return res.status(403).json({
        message: "This is not within your authority."
      })
    }

    next()

  } catch (err) {
    console.error(err)

    return res.status(500).json({
      message: "Internal Server Error"
    })
  }
}



async function verifyHrAdminOrEmployee(req, res, next) {
  try {
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      })
    } else if (user.role == "manager") {
      return res.status(403).json({
        message: "This is not within your authority."
      })
    }

    next()

  } catch (err) {
    console.error(err)

    return res.status(500).json({
      message: "Internal Server Error"
    })
  }
}



async function verifyHrAdminOrManager(req, res, next) {
  try {
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      })
    } else if (user.role == "employee") {
      return res.status(403).json({
        message: "This is not within your authority."
      })
    }

    next()

  } catch (err) {
    console.error(err)

    return res.status(500).json({
      message: "Internal Server Error"
    })
  }
}




module.exports = {
  verifyHrAdmin, verifyEmployee, verifyManager, verifyHrAdminOrEmployee, verifyHrAdminOrManager


}