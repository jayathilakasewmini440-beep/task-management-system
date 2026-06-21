const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendWelcomeEmail(toEmail, fullName, tempPassword) {
  const mailOptions = {
    from: `"Task Management System" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Your Task Management System Account',
    html: `
      <h2>Welcome to the Task Management System, ${fullName}!</h2>
      <p>Your account has been created. Use the temporary password below to log in:</p>
      <p style="font-size: 18px; font-weight: bold; background: #f4f4f4; padding: 10px; display: inline-block;">
        ${tempPassword}
      </p>
      <p>You will be required to set a new password after your first login.</p>
      <p>If you did not expect this email, please contact your administrator.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = sendWelcomeEmail;