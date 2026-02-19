const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/roleCheck");
const { payFee } = require("../controllers/paymentController");

router.use(protect);

// Student & Admin both can pay
router.post("/pay", authorize("student", "admin"), payFee);

// Add the additional payment routes
const {
  createPaymentOrder,
  verifyPayment,
} = require("../controllers/paymentController");

router.post("/create-order", createPaymentOrder);
router.post("/verify", verifyPayment);

module.exports = router;
