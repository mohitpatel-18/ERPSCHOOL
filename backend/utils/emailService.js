const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

/* ================= SEND EMAIL ================= */
exports.sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'School ERP <noreply@schoolerp.com>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments || [],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

/* ================= FEE PAYMENT CONFIRMATION EMAIL ================= */
exports.sendFeePaymentEmail = async (data) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .amount { font-size: 24px; font-weight: bold; color: #16a34a; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
        .label { font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Fee Payment Receipt</h1>
        </div>
        <div class="content">
          <p>Dear ${data.studentName},</p>
          <p>Your fee payment has been successfully processed.</p>
          
          <table>
            <tr>
              <td class="label">Receipt No:</td>
              <td>${data.receiptNo}</td>
            </tr>
            <tr>
              <td class="label">Date:</td>
              <td>${new Date().toLocaleDateString()}</td>
            </tr>
            <tr>
              <td class="label">Amount Paid:</td>
              <td class="amount">₹${data.amount}</td>
            </tr>
            <tr>
              <td class="label">Payment Method:</td>
              <td>${data.paymentMethod}</td>
            </tr>
            <tr>
              <td class="label">Transaction ID:</td>
              <td>${data.transactionId}</td>
            </tr>
          </table>
          
          <p>Thank you for your payment!</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
          <p>&copy; ${new Date().getFullYear()} School ERP System</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await this.sendEmail({
    to: data.email,
    subject: 'Fee Payment Confirmation',
    html,
  });
};

/* ================= EXAM NOTIFICATION EMAIL ================= */
exports.sendExamNotificationEmail = async (data) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">Exam Scheduled</h2>
        <p>Dear ${data.studentName},</p>
        <p>An exam has been scheduled:</p>
        <ul>
          <li><strong>Exam:</strong> ${data.examName}</li>
          <li><strong>Subject:</strong> ${data.subject}</li>
          <li><strong>Date:</strong> ${data.examDate}</li>
          <li><strong>Time:</strong> ${data.examTime}</li>
          <li><strong>Duration:</strong> ${data.duration} minutes</li>
        </ul>
        <p>Please prepare accordingly.</p>
        <p>Best wishes,<br>School Administration</p>
      </div>
    </body>
    </html>
  `;

  return await this.sendEmail({
    to: data.email,
    subject: `Exam Scheduled: ${data.examName}`,
    html,
  });
};

/* ================= HOMEWORK NOTIFICATION EMAIL ================= */
exports.sendHomeworkNotificationEmail = async (data) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">New Homework Assigned</h2>
        <p>Dear ${data.studentName},</p>
        <p>New homework has been assigned:</p>
        <ul>
          <li><strong>Subject:</strong> ${data.subject}</li>
          <li><strong>Title:</strong> ${data.title}</li>
          <li><strong>Due Date:</strong> ${data.dueDate}</li>
        </ul>
        <p><strong>Description:</strong></p>
        <p>${data.description}</p>
        <p>Please submit on time.</p>
      </div>
    </body>
    </html>
  `;

  return await this.sendEmail({
    to: data.email,
    subject: `Homework Assigned: ${data.subject}`,
    html,
  });
};

/* ================= RESULT PUBLISHED EMAIL ================= */
exports.sendResultPublishedEmail = async (data) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #16a34a;">Exam Results Published</h2>
        <p>Dear ${data.studentName},</p>
        <p>Results for ${data.examName} - ${data.subject} are now available.</p>
        <p style="font-size: 20px; color: #2563eb;">
          <strong>Marks Obtained:</strong> ${data.marksObtained}/${data.totalMarks}
        </p>
        <p><strong>Percentage:</strong> ${data.percentage}%</p>
        <p><strong>Grade:</strong> ${data.grade}</p>
        <p>Login to view detailed results.</p>
      </div>
    </body>
    </html>
  `;

  return await this.sendEmail({
    to: data.email,
    subject: `Results Published: ${data.examName}`,
    html,
  });
};
