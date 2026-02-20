const FeeTemplate = require('../models/FeeTemplate');
const StudentFee = require('../models/StudentFee');
const Payment = require('../models/Payment');
const Student = require('../models/Student');

/* ================= FEE ENGINE SERVICE ================= */
class FeeEngineService {
  
  /* ================= ASSIGN FEE TO STUDENT ================= */
  static async assignFeeToStudent(studentId, feeTemplateId, options = {}) {
    try {
      const student = await Student.findById(studentId).populate('class');
      const template = await FeeTemplate.findById(feeTemplateId);
      
      if (!student || !template) {
        throw new Error('Student or Fee Template not found');
      }

      // Check if fee already assigned for this academic year
      const existing = await StudentFee.findOne({
        student: studentId,
        academicYear: template.academicYear,
      });

      if (existing && !options.override) {
        throw new Error('Fee already assigned for this academic year');
      }

      // Calculate fee based on selected components
      const selectedComponents = options.selectedComponents || [];
      const appliedDiscounts = options.appliedDiscounts || [];
      
      const feeCalculation = template.calculateStudentFee(selectedComponents, appliedDiscounts);

      // Generate installments based on plan
      const installmentPlan = options.installmentPlan || template.defaultInstallmentPlan;
      const installments = this.generateInstallments(
        feeCalculation.netFee,
        installmentPlan,
        template,
        new Date()
      );

      // Create StudentFee record
      const studentFee = new StudentFee({
        student: studentId,
        academicYear: template.academicYear,
        class: student.class._id,
        feeTemplate: feeTemplateId,
        componentFees: feeCalculation.componentBreakdown,
        installmentPlan,
        installments,
        totalFeeAmount: feeCalculation.totalFee,
        totalDiscount: feeCalculation.totalDiscount,
        netFeeAmount: feeCalculation.netFee,
        balance: feeCalculation.netFee,
        appliedDiscounts: appliedDiscounts.map(d => {
          const discount = template.discountRules.id(d);
          return {
            discountName: discount.name,
            discountType: discount.type,
            amount: discount.discountType === 'Percentage' 
              ? (feeCalculation.totalFee * discount.value) / 100 
              : discount.value,
            appliedOn: new Date(),
            appliedBy: options.assignedBy,
          };
        }),
        assignedBy: options.assignedBy,
        isTransportIncluded: selectedComponents.includes('Transport Fee'),
        isHostelIncluded: selectedComponents.includes('Hostel Fee'),
        specialNotes: options.notes,
      });

      await studentFee.save();

      // Update template assigned count
      template.assignedStudentsCount += 1;
      await template.save();

      return studentFee;
    } catch (error) {
      throw error;
    }
  }

  /* ================= BULK ASSIGN FEE ================= */
  static async bulkAssignFee(studentIds, feeTemplateId, options = {}) {
    const results = {
      success: [],
      failed: [],
    };

    for (const studentId of studentIds) {
      try {
        const studentFee = await this.assignFeeToStudent(studentId, feeTemplateId, options);
        results.success.push({ studentId, studentFee });
      } catch (error) {
        results.failed.push({ studentId, error: error.message });
      }
    }

    return results;
  }

  /* ================= GENERATE INSTALLMENTS ================= */
  static generateInstallments(totalAmount, planType, template, startDate = new Date()) {
    const installments = [];
    const plan = template.installmentPlans.find(p => p.planName === planType);
    
    if (!plan) {
      // Fallback to single installment
      return [{
        installmentNumber: 1,
        installmentName: 'Full Payment',
        dueDate: new Date(startDate.getFullYear(), 3, 15), // April 15
        amount: totalAmount,
        paidAmount: 0,
        lateFee: 0,
        status: 'Pending',
      }];
    }

    plan.dueDates.forEach((dueInfo, index) => {
      const dueDate = new Date(startDate.getFullYear(), dueInfo.month - 1, dueInfo.date);
      
      // If due date has passed, set to next year
      if (dueDate < startDate) {
        dueDate.setFullYear(dueDate.getFullYear() + 1);
      }

      const installmentAmount = (totalAmount * dueInfo.percentage) / 100;

      installments.push({
        installmentNumber: dueInfo.installmentNumber,
        installmentName: `${planType} - ${index + 1}/${plan.numberOfInstallments}`,
        dueDate,
        amount: Math.round(installmentAmount),
        paidAmount: 0,
        lateFee: 0,
        discount: 0,
        status: 'Pending',
      });
    });

    // Adjust last installment to account for rounding differences
    const totalCalculated = installments.reduce((sum, i) => sum + i.amount, 0);
    const difference = totalAmount - totalCalculated;
    if (difference !== 0 && installments.length > 0) {
      installments[installments.length - 1].amount += difference;
    }

    return installments;
  }

  /* ================= PROCESS PAYMENT ================= */
  static async processPayment(studentFeeId, paymentData) {
    try {
      const studentFee = await StudentFee.findById(studentFeeId)
        .populate('student')
        .populate('feeTemplate');
      
      if (!studentFee) {
        throw new Error('Student fee record not found');
      }

      // Calculate late fee
      await studentFee.calculateLateFee();
      await studentFee.save();

      // Allocate payment to installments
      const allocations = this.allocatePaymentToInstallments(
        studentFee.installments,
        paymentData.amount
      );

      // Create payment record
      const payment = new Payment({
        student: studentFee.student._id,
        studentFee: studentFeeId,
        academicYear: studentFee.academicYear,
        paymentDate: paymentData.paymentDate || new Date(),
        amount: paymentData.amount,
        lateFeeAmount: allocations.totalLateFee,
        discountAmount: paymentData.discountAmount || 0,
        paymentMode: paymentData.paymentMode,
        paymentType: paymentData.paymentType || 'Offline',
        installmentAllocations: allocations.allocations,
        collectedBy: paymentData.collectedBy,
        collectorName: paymentData.collectorName,
        remarks: paymentData.remarks,
        
        // Gateway details (if online)
        gateway: paymentData.gateway,
        gatewayOrderId: paymentData.gatewayOrderId,
        gatewayPaymentId: paymentData.gatewayPaymentId,
        gatewaySignature: paymentData.gatewaySignature,
        gatewayResponse: paymentData.gatewayResponse,
        
        // Offline payment details
        chequeNumber: paymentData.chequeNumber,
        chequeDate: paymentData.chequeDate,
        bankName: paymentData.bankName,
        transactionId: paymentData.transactionId,
        upiId: paymentData.upiId,
        
        status: 'Success',
        approvalStatus: paymentData.paymentType === 'Online' ? 'Approved' : 'Pending',
      });

      await payment.save();

      return {
        payment,
        studentFee,
        allocations,
      };
    } catch (error) {
      throw error;
    }
  }

  /* ================= ALLOCATE PAYMENT TO INSTALLMENTS ================= */
  static allocatePaymentToInstallments(installments, paymentAmount) {
    const allocations = [];
    let remainingAmount = paymentAmount;
    let totalLateFee = 0;

    // Sort installments by due date (oldest first)
    const sortedInstallments = [...installments]
      .filter(i => i.status !== 'Paid' && i.status !== 'Waived')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    for (const installment of sortedInstallments) {
      if (remainingAmount <= 0) break;

      const pendingAmount = installment.amount - installment.paidAmount;
      const installmentLateFee = installment.lateFee || 0;
      const totalDue = pendingAmount + installmentLateFee;

      if (remainingAmount >= totalDue) {
        // Fully pay this installment
        allocations.push({
          installmentNumber: installment.installmentNumber,
          installmentName: installment.installmentName,
          allocatedAmount: pendingAmount,
          lateFeeAmount: installmentLateFee,
        });
        
        remainingAmount -= totalDue;
        totalLateFee += installmentLateFee;
      } else {
        // Partial payment
        // First pay late fee if any
        let allocatedToFee = 0;
        let allocatedToLateFee = 0;
        
        if (remainingAmount >= installmentLateFee) {
          allocatedToLateFee = installmentLateFee;
          allocatedToFee = remainingAmount - installmentLateFee;
        } else {
          allocatedToLateFee = remainingAmount;
        }

        if (allocatedToFee > 0 || allocatedToLateFee > 0) {
          allocations.push({
            installmentNumber: installment.installmentNumber,
            installmentName: installment.installmentName,
            allocatedAmount: allocatedToFee,
            lateFeeAmount: allocatedToLateFee,
          });
        }

        totalLateFee += allocatedToLateFee;
        remainingAmount = 0;
      }
    }

    return {
      allocations,
      totalLateFee,
      remainingAmount,
    };
  }

  /* ================= CALCULATE LATE FEES (BULK) ================= */
  static async calculateAllLateFees(academicYearId = null) {
    const query = { isActive: true };
    if (academicYearId) {
      query.academicYear = academicYearId;
    }

    const studentFees = await StudentFee.find(query);
    
    let updated = 0;
    for (const studentFee of studentFees) {
      await studentFee.calculateLateFee();
      await studentFee.save();
      updated++;
    }

    return { updated };
  }

  /* ================= APPLY DISCOUNT TO STUDENT ================= */
  static async applyDiscount(studentFeeId, discountData) {
    try {
      const studentFee = await StudentFee.findById(studentFeeId);
      
      if (!studentFee) {
        throw new Error('Student fee record not found');
      }

      const discountAmount = discountData.amount;
      
      studentFee.appliedDiscounts.push({
        discountName: discountData.name,
        discountType: discountData.type,
        amount: discountAmount,
        appliedOn: new Date(),
        appliedBy: discountData.appliedBy,
        remarks: discountData.remarks,
      });

      studentFee.totalDiscount += discountAmount;
      studentFee.netFeeAmount -= discountAmount;
      studentFee.balance -= discountAmount;

      await studentFee.save();

      return studentFee;
    } catch (error) {
      throw error;
    }
  }

  /* ================= WAIVE FEE ================= */
  static async waiveFee(studentFeeId, waiveData) {
    try {
      const studentFee = await StudentFee.findById(studentFeeId);
      
      if (!studentFee) {
        throw new Error('Student fee record not found');
      }

      studentFee.concessionAmount = waiveData.amount;
      studentFee.concessionReason = waiveData.reason;
      studentFee.concessionApprovedBy = waiveData.approvedBy;
      studentFee.concessionApprovedOn = new Date();
      
      await studentFee.save();

      return studentFee;
    } catch (error) {
      throw error;
    }
  }

  /* ================= GET OVERDUE STUDENTS ================= */
  static async getOverdueStudents(filters = {}) {
    return await StudentFee.getOverdueStudents(filters);
  }

  /* ================= GET DEFAULTERS ================= */
  static async getDefaulters(daysOverdue = 30) {
    return await StudentFee.getDefaulters(daysOverdue);
  }

  /* ================= GET COLLECTION SUMMARY ================= */
  static async getCollectionSummary(filters = {}) {
    const studentFeeSummary = await StudentFee.getCollectionSummary(filters);
    const paymentSummary = await Payment.getPaymentSummary(filters);
    
    return {
      ...studentFeeSummary,
      ...paymentSummary,
      collectionPercentage: studentFeeSummary.totalFeeAmount > 0 
        ? ((studentFeeSummary.totalCollected / studentFeeSummary.totalFeeAmount) * 100).toFixed(2)
        : 0,
    };
  }

  /* ================= SEND FEE REMINDERS ================= */
  static async sendFeeReminders(daysBeforeDue = 7) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysBeforeDue);

    const studentFees = await StudentFee.find({
      nextDueDate: {
        $gte: new Date(),
        $lte: targetDate,
      },
      overallStatus: { $in: ['Not Started', 'Partially Paid', 'Overdue'] },
      isActive: true,
    })
    .populate('student')
    .populate('class');

    // TODO: Send email/SMS reminders
    const reminders = [];
    
    for (const studentFee of studentFees) {
      // Mark reminder as sent
      studentFee.remindersSent += 1;
      studentFee.lastReminderDate = new Date();
      await studentFee.save();
      
      reminders.push({
        studentId: studentFee.student._id,
        studentName: `${studentFee.student.firstName} ${studentFee.student.lastName}`,
        dueAmount: studentFee.nextDueAmount,
        dueDate: studentFee.nextDueDate,
      });
    }

    return reminders;
  }

  /* ================= GENERATE FEE REPORT ================= */
  static async generateFeeReport(filters = {}) {
    const summary = await this.getCollectionSummary(filters);
    const overdueStudents = await this.getOverdueStudents(filters);
    const defaulters = await this.getDefaulters(30);
    
    // Payment mode wise collection
    const paymentModeWise = await Payment.aggregate([
      { $match: { status: 'Success', isDeleted: false, ...filters } },
      {
        $group: {
          _id: '$paymentMode',
          totalAmount: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        }
      }
    ]);

    // Class wise collection
    const classWise = await StudentFee.aggregate([
      { $match: { isActive: true, ...filters } },
      {
        $lookup: {
          from: 'classes',
          localField: 'class',
          foreignField: '_id',
          as: 'classInfo',
        }
      },
      { $unwind: '$classInfo' },
      {
        $group: {
          _id: '$class',
          className: { $first: '$classInfo.name' },
          totalStudents: { $sum: 1 },
          totalFee: { $sum: '$netFeeAmount' },
          totalCollected: { $sum: '$totalPaid' },
          totalPending: { $sum: '$balance' },
        }
      }
    ]);

    return {
      summary,
      overdueStudents: overdueStudents.length,
      defaulters: defaulters.length,
      paymentModeWise,
      classWise,
    };
  }
}

module.exports = FeeEngineService;
