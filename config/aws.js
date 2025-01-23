// src/config/aws.js
const { SESClient } = require("@aws-sdk/client-ses");
const { SNSClient } = require("@aws-sdk/client-sns");

// Create and configure an SNS client using AWS SDK v3
const snsClient = new SNSClient({
  region: "us-east-1", // Set your region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Create and configure an SES client using AWS SDK v3
const sesClient = new SESClient({
  region: "us-east-1", // Set your region
});

module.exports = { snsClient, sesClient };
