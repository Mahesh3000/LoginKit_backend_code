const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const otplib = require("otplib");
const redisClient = require("../config/redis");
const crypto = require("crypto");

const snsClient = require("../config/aws");
// const sesClient = require("../config/aws");

const sesClient = new SESClient({ region: process.env.AWS_REGION });

const sendEmailOtp = async (email, otp) => {
  // const otp = otplib.authenticator.generate(process.env.OTP_SECRET_KEY);

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

const generateOTP = (length = 6) => {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, digits.length);
    otp += digits[randomIndex];
  }
  return otp;
};

// const otp = generateSecureOTP();

const storeOTP = async (email, otp, ttl = 600) => {
  try {
    // Use setEx directly, as it supports promises
    const response = await redisClient.setEx(email, ttl, otp);
    return response; // Typically returns "OK" if successful
  } catch (error) {
    throw new Error(`Failed to store OTP: ${error.message}`);
  }
};

// Verify OTP from Redis
const verifyOTP = async (email, otp) => {
  try {
    // Retrieve the OTP from Redis
    const storedOtp = await redisClient.get(email);

    if (storedOtp === otp) {
      await redisClient.del(email);
      return true;
    }

    return false; // OTP doesn't match
  } catch (error) {
    throw new Error(`Failed to verify OTP: ${error.message}`);
  }
};

module.exports = { sendSmsOtp, sendEmailOtp, generateOTP, storeOTP, verifyOTP };
