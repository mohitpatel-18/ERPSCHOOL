const nodemailer = require("nodemailer");

/* ===================== TRANSPORTER ===================== */
/*
  🔥 IMPORTANT:
  - service: "gmail" use kar rahe hain
  - host / port / secure intentionally REMOVE
  - Ye method ISP / WiFi SMTP blocks bypass karta hai
*/
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,       // ✔️ Gmail address
    pass: process.env.EMAIL_PASSWORD,   // ✔️ Gmail App Password
  },
});

/* ===================== VERIFY TRANSPORTER ===================== */
transporter.verify((error) => {
  if (error) {
    console.error("❌ Email transporter error:", error.message);
  } else {
    console.log("✅ Email transporter ready");
  }
});

/* ===================== BASE SEND EMAIL ===================== */
const sendEmail = async ({ email, subject, html }) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject,
      html,
    });

    console.log("✅ Email sent successfully to:", email);
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    throw new Error("Email could not be sent");
  }
};

/* ===================== CREDENTIALS EMAIL ===================== */
const sendCredentialsEmail = async (email, name, role, userId, password) => {
  const html = `
    <h2>Welcome ${name}</h2>
    <p>Your <b>${role.toUpperCase()}</b> account has been created.</p>
    <p><b>Login Details:</b></p>
    <ul>
      <li>Email / ID: ${email} / ${userId}</li>
      <li>Password: ${password}</li>
    </ul>
    <p>
      <a href="${process.env.FRONTEND_URL}/erp-login">
        Login to ERP
      </a>
    </p>
    <br/>
    <p>— Samrose Nalanda School</p>
  `;

  await sendEmail({
    email,
    subject: `Your ${role} account credentials`,
    html,
  });
};

/* ===================== OTP EMAIL ===================== */
const sendOTPEmail = async (email, name, otp) => {
  const html = `
    <h2>Hello ${name}</h2>
    <p>Your OTP for email verification is:</p>
    <h1>${otp}</h1>
    <p>This OTP is valid for 10 minutes.</p>
    <br/>
    <p>— Samrose Nalanda School</p>
  `;

  await sendEmail({
    email,
    subject: "Email Verification OTP",
    html,
  });
};

/* ===================== PASSWORD RESET ===================== */
const sendPasswordResetEmail = async (email, name, resetUrl) => {
  const html = `
    <h2>Hello ${name}</h2>
    <p>You requested a password reset.</p>
    <p>Click the link below to reset your password:</p>
    <p>
      <a href="${resetUrl}" target="_blank">
        Reset Password
      </a>
    </p>
    <p>This link will expire in 30 minutes.</p>
    <br/>
    <p>If you did not request this, please ignore this email.</p>
    <br/>
    <p>— Samrose Nalanda School</p>
  `;

  await sendEmail({
    email,
    subject: "Password Reset Request",
    html,
  });
};

module.exports = {
  sendEmail,
  sendCredentialsEmail,
  sendOTPEmail,
  sendPasswordResetEmail,
};
