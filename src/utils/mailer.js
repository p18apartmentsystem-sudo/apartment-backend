const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // MUST be false for 587
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_APP_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

exports.sendOtpEmail = async (to, otp, apartmentName) => {
  const mailOptions = {
    from: `"${apartmentName}" <${process.env.SMTP_EMAIL}>`,
    to,
    subject: `${apartmentName} – Password Reset OTP`,
    text: `
Hello,

Your One Time Password (OTP) for ${apartmentName} is:

${otp}

This OTP is valid for 5 minutes.
Please do not share it with anyone.

Thanks,
${apartmentName} Team
                              -P18`,
  };

  await transporter.sendMail(mailOptions);
};

