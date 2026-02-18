const User = require("../models/User");
const bcrypt = require("bcryptjs");
const moment = require("moment-timezone");
const EmailOtp = require("../models/EmailOtp");
const { sendEmailOtp } = require("../services/email-otp.service");


// GET MY PROFILE
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("name mobile role isActive apartmentId flatId createdAt email emailVerified")
      .populate("apartmentId", "name address address_lg")
      .populate("flatId", "flatNumber floor");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message
    });
  }
};


/**
 * SEND EMAIL OTP
 */
exports.sendEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email }).populate({
      path: "apartmentId",
      select: "name",
    });

    if (!user) {
      return res.status(404).json({
        message: "User with this email does not exist",
      });
    }

    await sendEmailOtp({
      email,
      user,
      purpose: "verify_email",
    });

    return res.json({
      message: "OTP sent to email successfully",
    });
  } catch (err) {
    console.error("VERIFY EMAIL OTP ERROR:", err);
    return res.status(500).json({
      message: "Unable to send OTP",
    });
  }
};



/**
 * VERIFY EMAIL OTP
 */
exports.verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required"
      });
    }

    // 1️⃣ Find latest valid OTP
    const otpRecord = await EmailOtp.findOne({
      email,
      purpose: "verify_email",
      isUsed: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        message: "OTP expired or not found"
      });
    }

    // 2️⃣ Check attempts
    if (otpRecord.attempts >= 5) {
      return res.status(400).json({
        message: "Too many wrong attempts"
      });
    }

    // 3️⃣ Compare OTP
    const isValid = await bcrypt.compare(otp, otpRecord.otpHash);

    if (!isValid) {
      otpRecord.attempts += 1;
      await otpRecord.save();

      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    // 4️⃣ Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // 🔥 5️⃣ UPDATE USER EMAIL VERIFICATION
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found for this email"
      });
    }

    // If already verified (idempotent safety)
    if (!user.emailVerified) {
      user.emailVerified = true;
      user.emailVerifiedAt = new Date(); // optional but recommended
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Email verified successfully"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Email OTP verification failed",
      error: err.message
    });
  }
};

/**
 * UPDATE MY PROFILE
 */
exports.updateMyProfile = async (req, res) => {
  try {
    const { name, mobile, email } = req.body;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (mobile) user.mobile = mobile;

    // 🔥 If email changed → reset verification
    if (email && email !== user.email) {
      user.email = email;
      user.emailVerified = false;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        emailVerified: user.emailVerified
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Profile update failed",
      error: error.message
    });
  }
};

