const nodemailer = require("nodemailer");

/**
 * Create transporter fresh for every email (Render-safe)
 */
const createTransporter = async () => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_APP_PASS,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
    });

    await transporter.verify(); // IMPORTANT
    return transporter;
};

exports.sendOtpEmail = async (to, otp, apartmentName) => {
    const transporter = await createTransporter();

    const mailOptions = {
        from: `"${apartmentName}" <${process.env.SMTP_EMAIL}>`,
        to,
        subject: `${apartmentName} – OTP Verification`,
        text: `
Hello,

Your OTP for ${apartmentName} is:

${otp}

This OTP is valid for 5 minutes.
Do not share it with anyone.

Thanks,
${apartmentName} Team
-P18
`,
    };

    await transporter.sendMail(mailOptions);
};
