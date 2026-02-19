const AcademicYear = require("../models/AcademicYear");
const FeeStructure = require("../models/FeeStructure");
const Student = require("../models/Student");
const StudentFeeLedger = require("../models/StudentFeeLedger");

exports.generateMonthlyFees = async () => {
  try {
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    // 1️⃣ Get Active Academic Year
    const activeYear = await AcademicYear.findOne({ isActive: true });

    if (!activeYear) {
      console.log("No active academic year found");
      return;
    }

    // 2️⃣ Get All Active Fee Structures
    const feeStructures = await FeeStructure.find({
      academicYear: activeYear._id,
      isActive: true,
    }).populate("class");

    for (let structure of feeStructures) {
      // 3️⃣ Get Students of that class
      const students = await Student.find({
        class: structure.class._id,
      });

      for (let student of students) {
        // 4️⃣ Check if ledger already exists
        const exists = await StudentFeeLedger.findOne({
          student: student._id,
          month,
          year,
        });

        if (exists) continue;

        let components = [];
        let totalAmount = 0;

        for (let comp of structure.components) {
          // Monthly Component
          if (comp.type === "monthly") {
            components.push({
              name: comp.name,
              amount: comp.amount,
            });
            totalAmount += comp.amount;
          }

          // Yearly Component (only first month of session)
          if (
            comp.type === "yearly" &&
            month === activeYear.startDate.getMonth() + 1
          ) {
            components.push({
              name: comp.name,
              amount: comp.amount,
            });
            totalAmount += comp.amount;
          }

          // One-Time Component (only once ever)
          if (comp.type === "one-time") {
            const previousLedger = await StudentFeeLedger.findOne({
              student: student._id,
              "components.name": comp.name,
            });

            if (!previousLedger) {
              components.push({
                name: comp.name,
                amount: comp.amount,
              });
              totalAmount += comp.amount;
            }
          }
        }

        // 5️⃣ Create Ledger Entry
        await StudentFeeLedger.create({
          student: student._id,
          class: structure.class._id,
          academicYear: activeYear._id,
          month,
          year,
          components,
          totalAmount,
          balance: totalAmount,
          dueDate: new Date(year, month - 1, 10), // 10th of every month
        });

        console.log(
          `Ledger created for ${student._id} - ${month}/${year}`
        );
      }
    }

    console.log("Monthly fee generation completed");
  } catch (error) {
    console.error("Fee generation error:", error);
  }
};
