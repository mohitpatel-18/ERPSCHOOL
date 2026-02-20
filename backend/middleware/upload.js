// backend/middleware/upload.js
// UPGRADED: Uses Cloudinary instead of local disk storage
// This fixes the production blocker of local file storage

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// ================= CLOUDINARY STORAGE FOR LEAVE ATTACHMENTS =================
const leaveStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "erp/leaves",
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
    resource_type: "auto",
    // Unique filename: teacher-id + timestamp
    public_id: (req, file) => {
      const ext = file.originalname.split('.').pop();
      return `leave_${req.user._id}_${Date.now()}`;
    },
  },
});

// ================= CLOUDINARY STORAGE FOR RECEIPTS =================
const receiptStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "erp/receipts",
    allowed_formats: ["pdf"],
    resource_type: "auto",
    public_id: (req, file) => `receipt_${Date.now()}`,
  },
});

// ================= CLOUDINARY STORAGE FOR AVATARS =================
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "erp/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    resource_type: "image",
    transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
    public_id: (req, file) => `avatar_${req.user._id}`,
  },
});

// ================= FILE FILTER =================
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf", "image/webp"];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, WebP, PDF allowed"), false);
  }
};

// ================= MULTER INSTANCES =================
const uploadLeave = multer({
  storage: leaveStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

const uploadReceipt = multer({
  storage: receiptStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter,
});

module.exports = {
  uploadLeave,
  uploadReceipt,
  uploadAvatar,
  // backward compat — default export still works for leave routes
  default: uploadLeave,
  single: (field) => uploadLeave.single(field),
};