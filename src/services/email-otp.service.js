const bcrypt = require("bcryptjs");
const EmailOtp = require("../models/EmailOtp");
const { sendOtpEmail } = require("./email.service");

exports.sendEmailOtp = async ({ email, user, purpose }) => {
  let apartmentName = "Apartment";

  if (user.role === "super_admin") {
    apartmentName = "P18";
  } else if (user.apartmentId?.name) {
    apartmentName = user.apartmentId.name;
  }

  await EmailOtp.deleteMany({ email, purpose });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = await bcrypt.hash(otp, 10);

  await EmailOtp.create({
    email,
    otpHash,
    purpose,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  await sendOtpEmail(email, otp, apartmentName);
};
