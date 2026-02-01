const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const EmailOtp = require("../models/EmailOtp");
const { sendOtpEmail } = require("../utils/mailer");

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, mobile, password, role, email } = req.body;

    const userExists = await User.findOne({ mobile });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      mobile,
      password: hashedPassword,
      role,
      email,
      createdAt: moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        role: user.role,
        email: user.email,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    const user = await User.findOne({ mobile })
      .populate('apartmentId', 'name')
      .populate('flatId', 'flatNumber');

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        role: user.role,

        apartmentId: user.apartmentId
          ? {
            id: user.apartmentId._id,
            name: user.apartmentId.name,
          }
          : null,

        flatId: user.flatId
          ? {
            id: user.flatId._id,
            flatNumber: user.flatId.flatNumber,
          }
          : null,

        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
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

    // 1️⃣ Check user exists
    const user = await User.findOne({ email }).populate({
      path: "apartmentId",
      select: "name",
    });

    if (!user) {
      return res.status(404).json({
        message: "User with this email does not exist",
      });
    }

    // 2️⃣ Determine apartment name
    let apartmentName = "Apartment";

    if (user.role === "super_admin") {
      apartmentName = "P18";
    } else if (user.apartmentId?.name) {
      apartmentName = user.apartmentId.name;
    }

    // 3️⃣ Remove old OTPs
    await EmailOtp.deleteMany({
      email,
      purpose: "reset_password",
    });

    // 4️⃣ Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 5️⃣ Hash OTP
    const otpHash = await bcrypt.hash(otp, 10);

    // 6️⃣ Save OTP
    await EmailOtp.create({
      email,
      otpHash,
      purpose: "reset_password",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    // 7️⃣ Send email with apartment name
    await sendOtpEmail(email, otp, apartmentName);

    res.json({
      message: "OTP sent to email successfully",
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
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
      purpose: "reset_password",
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

    res.json({
      message: "OTP verified successfully"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * RESET PASSWORD (after OTP verification)
 */
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        message: "Email and new password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1️⃣ Check verified OTP exists
    const verifiedOtp = await EmailOtp.findOne({
      email: normalizedEmail,
      purpose: "reset_password",
      isUsed: true,
    }).sort({ updatedAt: -1 });

    if (!verifiedOtp) {
      return res.status(400).json({
        message: "OTP not verified or expired",
      });
    }

    // 2️⃣ Find user
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 3️⃣ Hash new password
    const hash = await bcrypt.hash(newPassword, 10);

    // 4️⃣ Update password
    user.password = hash;
    await user.save();

    // 5️⃣ Cleanup OTPs (important)
    await EmailOtp.deleteMany({
      email: normalizedEmail,
      purpose: "reset_password",
    });

    res.json({
      message: "Password reset successfully",
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
