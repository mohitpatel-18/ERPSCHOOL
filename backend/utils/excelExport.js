const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

/* ================= EXPORT FEE REPORT TO EXCEL ================= */
exports.exportFeeReport = async (data, filters) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Fee Report');

  // Set column headers
  worksheet.columns = [
    { header: 'Student ID', key: 'studentId', width: 15 },
    { header: 'Student Name', key: 'studentName', width: 25 },
    { header: 'Class', key: 'class', width: 15 },
    { header: 'Total Fees', key: 'totalFees', width: 12 },
    { header: 'Paid', key: 'paid', width: 12 },
    { header: 'Pending', key: 'pending', width: 12 },
    { header: 'Discount', key: 'discount', width: 12 },
    { header: 'Late Fine', key: 'lateFine', width: 12 },
    { header: 'Status', key: 'status', width: 12 },
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2563EB' },
  };
  worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

  // Add data rows
  data.forEach(item => {
    worksheet.addRow(item);
  });

  // Add total row
  const lastRow = worksheet.lastRow.number + 1;
  worksheet.getCell(`A${lastRow}`).value = 'TOTAL';
  worksheet.getCell(`A${lastRow}`).font = { bold: true };
  
  worksheet.getCell(`D${lastRow}`).value = { 
    formula: `SUM(D2:D${lastRow - 1})` 
  };
  worksheet.getCell(`E${lastRow}`).value = { 
    formula: `SUM(E2:E${lastRow - 1})` 
  };
  worksheet.getCell(`F${lastRow}`).value = { 
    formula: `SUM(F2:F${lastRow - 1})` 
  };

  // Auto-filter
  worksheet.autoFilter = {
    from: 'A1',
    to: `I${lastRow}`,
  };

  // Save file
  const reportsDir = path.join(__dirname, '../../reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const fileName = `fee_report_${Date.now()}.xlsx`;
  const filePath = path.join(reportsDir, fileName);

  await workbook.xlsx.writeFile(filePath);

  return `/reports/${fileName}`;
};

/* ================= EXPORT ATTENDANCE REPORT ================= */
exports.exportAttendanceReport = async (data, filters) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Attendance Report');

  worksheet.columns = [
    { header: 'Student ID', key: 'studentId', width: 15 },
    { header: 'Student Name', key: 'studentName', width: 25 },
    { header: 'Class', key: 'class', width: 15 },
    { header: 'Total Days', key: 'totalDays', width: 12 },
    { header: 'Present', key: 'present', width: 12 },
    { header: 'Absent', key: 'absent', width: 12 },
    { header: 'Late', key: 'late', width: 12 },
    { header: 'Attendance %', key: 'percentage', width: 15 },
  ];

  // Style
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF16A34A' },
  };
  worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

  data.forEach(item => {
    worksheet.addRow(item);
  });

  const reportsDir = path.join(__dirname, '../../reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const fileName = `attendance_report_${Date.now()}.xlsx`;
  const filePath = path.join(reportsDir, fileName);

  await workbook.xlsx.writeFile(filePath);

  return `/reports/${fileName}`;
};

/* ================= EXPORT EXAM RESULTS ================= */
exports.exportExamResults = async (data, examInfo) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Exam Results');

  // Add exam info at top
  worksheet.mergeCells('A1:F1');
  worksheet.getCell('A1').value = `Exam: ${examInfo.name}`;
  worksheet.getCell('A1').font = { size: 16, bold: true };
  worksheet.getCell('A1').alignment = { horizontal: 'center' };

  worksheet.mergeCells('A2:F2');
  worksheet.getCell('A2').value = `Subject: ${examInfo.subject} | Date: ${new Date(examInfo.date).toLocaleDateString()}`;
  worksheet.getCell('A2').alignment = { horizontal: 'center' };

  // Headers
  worksheet.getRow(4).values = [
    'Student ID',
    'Student Name',
    'Marks Obtained',
    'Total Marks',
    'Percentage',
    'Grade',
    'Status',
  ];

  worksheet.getRow(4).font = { bold: true };
  worksheet.getRow(4).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFBBF24' },
  };

  // Data
  let rowIndex = 5;
  data.forEach(item => {
    worksheet.getRow(rowIndex).values = [
      item.studentId,
      item.studentName,
      item.marksObtained,
      item.totalMarks,
      item.percentage,
      item.grade,
      item.status,
    ];
    rowIndex++;
  });

  const reportsDir = path.join(__dirname, '../../reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const fileName = `exam_results_${Date.now()}.xlsx`;
  const filePath = path.join(reportsDir, fileName);

  await workbook.xlsx.writeFile(filePath);

  return `/reports/${fileName}`;
};
