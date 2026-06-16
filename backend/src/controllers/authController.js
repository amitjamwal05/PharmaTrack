const User = require('../models/User');
const Store = require('../models/Store');
const Otp = require('../models/Otp');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// @desc    Register new user and store
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, storeName, phone, otp } = req.body;

    if (!name || !email || !password || !storeName || !otp) {
      return res.status(400).json({ message: 'Please add all fields including OTP' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Verify OTP
    const validOtp = await Otp.findOne({ email, otp });
    if (!validOtp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Delete OTP after successful verification
    await Otp.deleteMany({ email });

    // Create store
    const store = await Store.create({
      name: storeName,
      phone,
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
      storeId: store._id,
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        storeId: user.storeId,
        storeName: store.name,
        subscriptionPlan: store.subscriptionPlan,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate('storeId');

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        storeId: user.storeId ? user.storeId._id : null,
        storeName: user.storeId ? user.storeId.name : null,
        subscriptionPlan: user.storeId ? user.storeId.subscriptionPlan : null,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add new staff member
// @route   POST /api/auth/staff
// @access  Private/Admin
exports.addStaff = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'staff',
      storeId: req.user.storeId,
    });

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get store staff
// @route   GET /api/auth/staff
// @access  Private/Admin
exports.getStaff = async (req, res) => {
  try {
    const staff = await User.find({ storeId: req.user.storeId }).select('-password');
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete staff member
// @route   DELETE /api/auth/staff/:id
// @access  Private/Admin
exports.deleteStaff = async (req, res) => {
  try {
    if (req.params.id === req.user.id.toString()) {
       return res.status(400).json({ message: 'Cannot delete yourself' });
    }

    const user = await User.findOneAndDelete({ _id: req.params.id, storeId: req.user.storeId });
    if (!user) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    res.status(200).json({ message: 'Staff removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset staff password
// @route   PUT /api/auth/staff/:id/reset-password
// @access  Private/Admin
exports.resetStaffPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: 'Please provide a new password' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, storeId: req.user.storeId },
      { password: hashedPassword }
    );

    if (!user) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate and send OTP to email
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing OTPs for this email to prevent spam
    await Otp.deleteMany({ email });

    await Otp.create({ email, otp });

    const mailOptions = {
      from: `"PharmaTrack Verification" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your PharmaTrack Registration OTP',
      text: `Your verification code is: ${otp}. It will expire in 10 minutes.`,
      html: `<p>Your verification code is: <strong style="font-size: 24px;">${otp}</strong></p><p>It will expire in 10 minutes.</p>`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
