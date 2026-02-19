const StudentFeeLedger = require("../models/StudentFeeLedger");

exports.processPayment = async ({
  ledgerId,
  amount,
  method,
  transactionId,
}) => {
  try {
    const ledger = await StudentFeeLedger.findById(ledgerId);

    if (!ledger) {
      throw new Error("Ledger not found");
    }

    if (ledger.status === "paid") {
      throw new Error("Fee already paid");
    }

    // 🔥 Calculate Late Fine if overdue
    const today = new Date();
    if (today > ledger.dueDate && ledger.balance > 0) {
      const diffDays = Math.ceil(
        (today - ledger.dueDate) / (1000 * 60 * 60 * 24)
      );

      const lateFineAmount = diffDays * 50; // You can improve later
      ledger.lateFine = lateFineAmount;

      ledger.balance += lateFineAmount;
    }

    if (amount > ledger.balance) {
      throw new Error("Payment exceeds pending balance");
    }

    // Update paid amount
    ledger.paidAmount += amount;
    ledger.balance -= amount;

    // Add payment history
    ledger.paymentHistory.push({
      amount,
      method,
      transactionId: transactionId || null,
    });

    // Update Status
    if (ledger.balance === 0) {
      ledger.status = "paid";
    } else if (ledger.paidAmount > 0) {
      ledger.status = "partial";
    }

    await ledger.save();

    return ledger;
  } catch (error) {
    throw error;
  }
};
