const sendLoginResponse = (res, user, token, message = "Login successful") => {
  res.status(200).json({
    success: true,
    message,
    token, // JWT token
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      is_first_time_user: user.is_first_time_user,
      totp_enabled: user.totp_enabled,
      otp_enabled: user.otp_enabled,
      two_fa_method: user.two_fa_method, // Add any other relevant fields
    },
  });
};

module.exports = { sendLoginResponse };
