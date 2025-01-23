const validateRegistrationData = (username, email, password, phone_number) => {
  if (!username || !email || !password || !phone_number) {
    return "All fields are required.";
  }

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  const phoneRegex = /^(\+?\d{1,2}\s?)?(\(?\d{3}\)?[\s\-]?)?[\d\s\-]{7,10}$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address.";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters long.";
  }

  if (phone_number.length < 10 || !phoneRegex.test(phone_number)) {
    return "Please enter a valid Phone Number ";
  }

  return null; // No errors
};

module.exports = { validateRegistrationData };
