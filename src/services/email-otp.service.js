const bcrypt = require("bcryptjs");
const EmailOtp = require("../models/EmailOtp");
const { sendOtpEmail } = require("./email.service"); // 👈 IMPORTANT PATH

exports.sendEmailOtp = async ({ email, user, purpose }) => {
    // Apartment name
    let apartmentName = "Apartment";

    if (user.role === "super_admin") {
        apartmentName = "P18";
    } else if (user.apartmentId?.name) {
        apartmentName = user.apartmentId.name;
    }

    // Remove old OTPs
    await EmailOtp.deleteMany({ email, purpose });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP
    const otpHash = await bcrypt.hash(otp, 10);

    // Save OTP
    await EmailOtp.create({
        email,
        otpHash,
        purpose,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    // Send Email
    await sendOtpEmail(email, otp, apartmentName);
};
