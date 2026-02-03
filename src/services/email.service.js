const SibApiV3Sdk = require("sib-api-v3-sdk");

// Initialize Brevo client
const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

/**
 * Send OTP Email using Brevo API
 */
exports.sendOtpEmail = async (to, otp, apartmentName) => {
  try {
    await tranEmailApi.sendTransacEmail({
      sender: {
        email: process.env.EMAIL, 
        name: apartmentName,
      },
      to: [
        {
          email: to,
        },
      ],
      subject: `${apartmentName} – OTP Verification`,
      textContent: `
Hello,

Your One Time Password (OTP) for ${apartmentName} is:

${otp}

This OTP is valid for 5 minutes.
Please do not share it with anyone.

Thanks,
${apartmentName} Team
-P18
`,
    });
  } catch (error) {
    console.error("❌ BREVO EMAIL ERROR:", error?.response?.text || error);
    throw error; // important so controller returns 500
  }
};
