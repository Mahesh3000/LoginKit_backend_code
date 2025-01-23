const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const otplib = require("otplib");

const snsClient = require("../config/aws");
// const sesClient = require("../config/aws");

const sesClient = new SESClient({ region: process.env.AWS_REGION });

const sendEmailOtp = async (email) => {
  const otp = otplib.authenticator.generate(process.env.OTP_SECRET_KEY);

  // HTML content for the email
  const htmlContent = `
    <html>
      <body>
        <h1 style="text-align: center; color: #4CAF50;">Your OTP Code</h1>
        <p style="font-size: 16px; text-align: center;">Your OTP for verification is:</p>
        <h2 style="text-align: center; color: #333;">${otp}</h2>
        <p style="text-align: center; font-size: 14px; color: #777;">
          This OTP is valid for 10 minutes. Please do not share it with anyone.
        </p>
      </body>
    </html>
  `;

  const params = {
    Source: process.env.SES_VERIFIED_EMAIL,
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Subject: {
        Charset: "UTF-8",
        Data: "Your OTP Code chuskora",
      },
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: htmlContent,
        },
      },
    },
  };

  try {
    const command = new SendEmailCommand(params);
    const result = await sesClient.send(command);
    return { success: true, otp, messageId: result.MessageId };
  } catch (error) {
    console.error("Error sending Email OTP:", error);
    return { success: false, error: error.message };
  }
};

const sendSmsOtp = async (phoneNumber) => {
  const otp = otplib.authenticator.generate(process.env.OTP_SECRET_KEY);

  const params = {
    Message: `Your OTP is: ${otp}`,
    PhoneNumber: `+1${phoneNumber}`, // Replace "+1" with the appropriate country code
    MessageType: "Transactional",
  };

  const command = new PublishCommand(params);

  try {
    const result = await snsClient.send(command);
    console.log("SMS OTP sent successfully:", result);
    return { success: true, otp, messageId: result.MessageId };
  } catch (error) {
    console.error("Error sending SMS OTP:", error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendSmsOtp, sendEmailOtp };
