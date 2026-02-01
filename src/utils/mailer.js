const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,      // your gmail
    pass: process.env.SMTP_APP_PASS,   // gmail app password
  },
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

