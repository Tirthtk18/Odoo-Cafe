const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // bypass self-signed cert issues on local/corporate networks
  },
});

const sendOTPEmail = async (toEmail, otp) => {
  await transporter.sendMail({
    from: `"POS Café" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'Your POS Café Verification Code',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #eee;border-radius:12px;">
        <h2 style="color:#1a1a1a;margin-bottom:8px;">☕ POS Café</h2>
        <p style="color:#555;margin-bottom:24px;">Use the code below to verify your email. It expires in <strong>10 minutes</strong>.</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#1a1a1a;background:#f5f5f5;padding:20px;border-radius:8px;text-align:center;">
          ${otp}
        </div>
        <p style="color:#999;font-size:12px;margin-top:24px;">If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
};

const sendWelcomeEmail = async (toEmail, name, role, password) => {
  await transporter.sendMail({
    from: `"POS Café" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'Your POS Café Account is Ready',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #eee;border-radius:12px;">
        <h2 style="color:#1a1a1a;margin-bottom:8px;">☕ POS Café</h2>
        <p style="color:#555;">Hello <strong>${name}</strong>,</p>
        <p style="color:#555;margin-bottom:24px;">Your account has been created by the admin. Here are your login details:</p>
        <div style="background:#f5f5f5;padding:16px;border-radius:8px;margin-bottom:16px;">
          <p style="margin:4px 0;color:#333;"><strong>Role:</strong> ${role}</p>
          <p style="margin:4px 0;color:#333;"><strong>Email:</strong> ${toEmail}</p>
          <p style="margin:4px 0;color:#333;"><strong>Password:</strong> ${password}</p>
        </div>
        <p style="color:#999;font-size:12px;">Please change your password after first login.</p>
      </div>
    `,
  });
};

module.exports = { sendOTPEmail, sendWelcomeEmail };
