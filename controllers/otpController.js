const { sendSmsOtp, sendEmailOtp } = require("../services/otpServices");
const {
  ListIdentitiesCommand,
  VerifyEmailAddressCommand,
  SESClient,
  GetIdentityVerificationAttributesCommand,
} = require("@aws-sdk/client-ses");
const { getUserByEmailOrUsername } = require("../services/userServices");
const { authenticator } = require("otplib");
const { generateOTP, storeOTP, verifyOTP } = require("../services/otpServices");
const { generateToken } = require("../config/jwt");
const { sendLoginResponse } = require("../utils/response");

// const sesClient = require("../config/aws");
const sesClient = new SESClient({ region: process.env.AWS_REGION });

const listOfVerfiedEmailHandler = async (req, res = null) => {
  try {
    // Step 1: List all identities (emails) in SES
    const params = { IdentityType: "EmailAddress" };
    const command = new ListIdentitiesCommand(params);
    const data = await sesClient.send(command);
    const identities = data.Identities || [];

    // Step 2: Get verification attributes for all identities
    const verifyCommand = new GetIdentityVerificationAttributesCommand({
      Identities: identities,
    });

    const verifyData = await sesClient.send(verifyCommand);

    // Filter and return only the verified emails
    const verifiedEmails = identities.filter(
      (identity) =>
        verifyData.VerificationAttributes[identity]?.VerificationStatus ===
        "Success"
    );

    // If the function is called as part of an API request, send a response
    if (res) {
      return res.status(200).json({ verifiedEmails });
    }

    // If it's not an API request, return the verified emails
    return verifiedEmails;
  } catch (error) {
    console.error("Error fetching verified emails:", error.message);

    // If the function is called as part of an API request, send a response
    if (res) {
      return res.status(500).json({
        message: "Failed to fetch verified emails",
        error: error.message,
      });
    }

    // If it's not an API request, throw an error to be handled by the calling function
    throw new Error("Failed to fetch verified emails");
  }
};

const verifyEmailHandler = async (req, res) => {
  const { email } = req.body;

  // Check if email is provided
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Create a command to verify the email
    const command = new VerifyEmailAddressCommand({
      EmailAddress: email,
    });

    // Send the command to SES
    const data = await sesClient.send(command);

    // Log the response (for debugging/monitoring)
    console.log("SES Response: ", data);

    // Respond with success message
    return res.status(200).json({
      success: true,
      message: `Verification email has been sent to ${email}. Please check your inbox.`,
      // data: data,
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error verifying email:", error);

    // Handle different error scenarios
    if (error.code === "MessageRejected") {
      return res.status(400).json({
        message: "Email address is already verified or rejected.",
        error: error.message,
      });
    }

    // Catch any other errors and return a generic error message
    return res.status(500).json({
      message: "Error verifying email address.",
      error: error.message,
    });
  }
};

// const verifyOtpHandler = async (req, res) => {
//   const { otp, userEmail } = req.body;

//   if (!otp) {
//     return res.status(400).json({ success: false, message: "OTP is required" });
//   }

//   if (!userEmail) {
//     return res
//       .status(400)
//       .json({ success: false, message: "User email is required" });
//   }

//   try {
//     // Retrieve the user's OTP secret key from the database
//     const user = await getUserByEmailOrUsername(userEmail); // Assuming getUserByEmail is a function that retrieves user data

//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }

//     const userOtpSecret = user.otp_secret; // Ensure you have the OTP secret saved per user

//     // Verify OTP using the secret key retrieved from the database
//     const isValid = authenticator.check(otp, userOtpSecret);

//     if (isValid) {
//       return res.status(200).json({ success: true, message: "OTP verified" });
//     } else {
//       return res.status(400).json({ success: false, message: "Invalid OTP" });
//     }
//   } catch (error) {
//     console.error("Error verifying OTP:", error);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };

const sendEmailOtpHandler = async (req, res) => {
  const { body } = req;

  // Check if req.body is defined
  if (!body || !body.email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const { email } = body;

  try {
    const verifiedEmails = await listOfVerfiedEmailHandler();

    if (!verifiedEmails.includes(email)) {
      console.log(`Verification email sent to ${email}. Please verify.`);
      return res.status(400).json({
        message: `Email verification required. Please verify your email address to proceed.`,
      });
    }

    const result = await sendEmailOtp(email);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "OTP sent successfully via email",
      });
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("Error handling email OTP:", error.message);
    return res.status(500).json({
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};

const sendPhoneOtpHandler = async (req, res) => {
  const { phoneNumber } = req.body;

  // Check if phone number is provided
  if (!phoneNumber) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  try {
    const result = await sendSmsOtp(phoneNumber);

    // Check the result and respond accordingly
    if (result.success) {
      return res.status(200).json({
        message: "OTP sent successfully via SMS",
        otp: result.otp,
      });
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("Error sending phone OTP:", error.message);
    return res.status(500).json({
      message: "Failed to send phone OTP",
      error: error.message,
    });
  }
};

const requestOTPHandler = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const otp = generateOTP(6);

  try {
    const isOtpStored = await storeOTP(email, otp);
    if (isOtpStored == "OK") {
      const result = await sendEmailOtp(email, otp);
      res.json({ message: "OTP stored sucessfull", otp, isOtpStored, result });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to send OTP", error });
  }
};

const verifyOtpHandler = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const isValid = await verifyOTP(email, otp);
    if (isValid) {
      // // res.json({ message: "OTP verified successfully" });
      // return res.status(200).json({
      //   success: true,
      //   message: "OTP verified successfully",
      // });
      const user = await getUserByEmailOrUsername(email);

      const token = generateToken({
        id: user.id,
        email: user.email,
        username: user.username,
      });

      // Send login response using sendLoginResponse
      return sendLoginResponse(res, user, token, "OTP verified successfully");
    } else {
      res.status(400).json({ message: "Invalid or expired OTP" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to verify OTP in contrller", error });
  }
};

module.exports = {
  sendEmailOtpHandler,
  sendPhoneOtpHandler,
  listOfVerfiedEmailHandler,
  verifyEmailHandler,
  verifyOtpHandler,
  requestOTPHandler,
};
