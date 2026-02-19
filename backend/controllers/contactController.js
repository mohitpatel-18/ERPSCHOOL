exports.submitContact = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // You can save to database or send email
    // For now, just send success response

    res.status(200).json({
      success: true,
      message: 'Thank you for contacting us. We will get back to you soon.',
    });
  } catch (error) {
    next(error);
  }
};