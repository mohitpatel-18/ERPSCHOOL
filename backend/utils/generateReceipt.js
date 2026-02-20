const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate Fee Receipt PDF
 */
const generateFeeReceipt = async (paymentData) => {
  return new Promise((resolve, reject) => {
    try {
      // Create receipts directory if not exists
      const receiptsDir = path.join(__dirname, '../../receipts');
      if (!fs.existsSync(receiptsDir)) {
        fs.mkdirSync(receiptsDir, { recursive: true });
      }

      const fileName = `receipt_${paymentData.receiptNo}_${Date.now()}.pdf`;
      const filePath = path.join(receiptsDir, fileName);

      // Create PDF document
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Header
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('SCHOOL FEE RECEIPT', { align: 'center' })
        .moveDown();

      // School Details
      doc
        .fontSize(12)
        .font('Helvetica')
        .text('School ERP System', { align: 'center' })
        .text('Address Line 1, City, State - PIN', { align: 'center' })
        .text('Phone: +91-XXXXXXXXXX | Email: info@school.com', { align: 'center' })
        .moveDown(2);

      // Receipt Number and Date
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(`Receipt No: ${paymentData.receiptNo}`, 50, 150)
        .text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 400, 150)
        .moveDown(2);

      // Student Details
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Student Details:', 50, 190)
        .font('Helvetica')
        .fontSize(10)
        .text(`Name: ${paymentData.studentName}`, 50, 210)
        .text(`Student ID: ${paymentData.studentId}`, 50, 225)
        .text(`Class: ${paymentData.className}`, 50, 240)
        .text(`Academic Year: ${paymentData.academicYear}`, 50, 255)
        .moveDown(2);

      // Payment Details Header
      const tableTop = 290;
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Payment Details:', 50, tableTop)
        .moveDown();

      // Table Header
      const headerY = tableTop + 30;
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Description', 50, headerY)
        .text('Amount (₹)', 400, headerY, { width: 100, align: 'right' });

      // Draw line under header
      doc
        .moveTo(50, headerY + 15)
        .lineTo(550, headerY + 15)
        .stroke();

      let currentY = headerY + 25;

      // Fee Components
      doc.font('Helvetica').fontSize(10);
      
      paymentData.components.forEach((component) => {
        doc
          .text(component.name, 50, currentY)
          .text(component.amount.toFixed(2), 400, currentY, { width: 100, align: 'right' });
        currentY += 20;
      });

      // Subtotal
      currentY += 10;
      doc
        .font('Helvetica-Bold')
        .text('Subtotal:', 50, currentY)
        .text(paymentData.totalAmount.toFixed(2), 400, currentY, { width: 100, align: 'right' });

      currentY += 20;

      // Discount (if any)
      if (paymentData.discount > 0) {
        doc
          .fillColor('green')
          .text('Discount:', 50, currentY)
          .text(`- ${paymentData.discount.toFixed(2)}`, 400, currentY, { width: 100, align: 'right' })
          .fillColor('black');
        currentY += 20;
      }

      // Late Fine (if any)
      if (paymentData.lateFine > 0) {
        doc
          .fillColor('red')
          .text('Late Fine:', 50, currentY)
          .text(paymentData.lateFine.toFixed(2), 400, currentY, { width: 100, align: 'right' })
          .fillColor('black');
        currentY += 20;
      }

      // Draw line before total
      doc
        .moveTo(50, currentY)
        .lineTo(550, currentY)
        .stroke();

      currentY += 10;

      // Total Amount
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Total Amount:', 50, currentY)
        .text(paymentData.finalAmount.toFixed(2), 400, currentY, { width: 100, align: 'right' });

      currentY += 30;

      // Amount Paid
      doc
        .fillColor('green')
        .text('Amount Paid:', 50, currentY)
        .text(paymentData.amountPaid.toFixed(2), 400, currentY, { width: 100, align: 'right' })
        .fillColor('black');

      currentY += 25;

      // Payment Method
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Payment Method: ${paymentData.paymentMethod}`, 50, currentY);

      if (paymentData.transactionId) {
        currentY += 15;
        doc.text(`Transaction ID: ${paymentData.transactionId}`, 50, currentY);
      }

      // Footer
      currentY += 50;
      doc
        .fontSize(9)
        .font('Helvetica-Oblique')
        .text('This is a computer-generated receipt. No signature required.', 50, currentY, {
          align: 'center',
        })
        .moveDown()
        .text('Thank you for your payment!', { align: 'center' });

      // Finalize PDF
      doc.end();

      stream.on('finish', () => {
        resolve(`/receipts/${fileName}`);
      });

      stream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateFeeReceipt };
