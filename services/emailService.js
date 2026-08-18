const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    console.log(`[Email Service] Configured custom SMTP transport (${process.env.SMTP_HOST})`);
  } else {
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log('[Email Service] Configured Ethereal Test Account for email preview links.');
    } catch (err) {
      console.warn('[Email Service Warning] Failed to create test account:', err.message);
    }
  }

  return transporter;
}

async function sendPasswordResetEmail(toEmail, resetToken, hostUrl) {
  const mailTransporter = await getTransporter();
  const resetLink = `${hostUrl}/reset-password.html?token=${resetToken}`;
  const fromAddress = process.env.SMTP_FROM || '"Vatika Botanical Sanctuary" <no-reply@vatika-sanctuary.org>';

  const mailOptions = {
    from: fromAddress,
    to: toEmail,
    subject: '🌱 Reset Your Vatika Sanctuary Account Password',
    html: `
      <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #030a06; color: #e2e8f0; padding: 40px 20px; text-align: center;">
        <div style="max-width: 560px; margin: 0 auto; background: #081a10; border: 1px solid #14532d; border-radius: 16px; padding: 36px; box-shadow: 0 12px 32px rgba(0,0,0,0.5);">
          
          <div style="margin-bottom: 24px;">
            <div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; border-radius: 50%; background: rgba(52, 211, 153, 0.15); border: 1.5px solid #34d399; font-size: 28px;">
              🌿
            </div>
            <h1 style="font-family: 'Georgia', serif; font-size: 26px; color: #ffffff; margin-top: 16px; margin-bottom: 6px;">Vatika Herbal Sanctuary</h1>
            <p style="font-size: 14px; color: #94a3b8; margin: 0;">Password Recovery Request</p>
          </div>

          <div style="border-top: 1px solid rgba(255,255,255,0.1); border-bottom: 1px solid rgba(255,255,255,0.1); padding: 24px 0; margin-bottom: 28px; text-align: left; line-height: 1.6;">
            <p style="font-size: 15px; color: #cbd5e1; margin-bottom: 16px;">Hello,</p>
            <p style="font-size: 15px; color: #cbd5e1; margin-bottom: 20px;">
              We received a request to reset the password for your Vatika Sanctuary account (<strong>${toEmail}</strong>). Click the button below to choose a new password. This link will expire in <strong>1 hour</strong>.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 9999px; box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);">
                Reset My Password →
              </a>
            </div>

            <p style="font-size: 13px; color: #94a3b8;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetLink}" style="color: #34d399; word-break: break-all;">${resetLink}</a>
            </p>
          </div>

          <p style="font-size: 12px; color: #64748b; margin: 0;">
            If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.<br><br>
            © 2026 Vatika Botanical Sanctuary • Protected Educational Environment
          </p>

        </div>
      </div>
    `
  };

  if (!mailTransporter) {
    console.log(`\n==================================================`);
    console.log(`[DEVELOPMENT RESET LINK PREVIEW]`);
    console.log(`To: ${toEmail}`);
    console.log(`Reset Link: ${resetLink}`);
    console.log(`==================================================\n`);
    return { success: true, previewUrl: resetLink };
  }

  const info = await mailTransporter.sendMail(mailOptions);
  const previewUrl = nodemailer.getTestMessageUrl(info);
  
  if (previewUrl) {
    console.log(`\n==================================================`);
    console.log(`📩 [Ethereal Email Sent] Password Reset Email`);
    console.log(`To: ${toEmail}`);
    console.log(`Preview Email in Browser: ${previewUrl}`);
    console.log(`Reset Link: ${resetLink}`);
    console.log(`==================================================\n`);
  } else {
    console.log(`[Email Sent] Password reset email sent to ${toEmail}`);
  }

  return { success: true, previewUrl: previewUrl || resetLink };
}

module.exports = {
  sendPasswordResetEmail
};
