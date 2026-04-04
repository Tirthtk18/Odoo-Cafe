const User = require('../models/User');
const OTP = require('../models/OTP');
const jwt  = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');
const { sendOTPEmail, sendWelcomeEmail } = require('../config/mailer');

const generateOTP   = () => Math.floor(100000 + Math.random() * 900000).toString();
const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ─── POST /api/auth/signup ───────────────────────────────────────────────────
// Admin or User (customer) self-registers → OTP sent to email
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });

    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    // Only admin and user roles can self-register
    const allowedSelfRoles = ['admin', 'user'];
    const assignedRole = allowedSelfRoles.includes(role) ? role : 'user';

    const exists = await User.findOne({ email });

    if (exists && exists.isVerified)
      return res.status(400).json({ message: 'Email already registered. Please login.' });

    // Remove unverified account to allow retry
    if (exists && !exists.isVerified) await User.deleteOne({ email });

    await User.create({ name, email, password, role: assignedRole, isVerified: false });

    // Remove old OTP and create new
    await OTP.deleteMany({ email });
    const otp = generateOTP();
    await OTP.create({
      email,
      otp: await bcrypt.hash(otp, 10),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    await sendOTPEmail(email, otp);
    res.status(200).json({ message: 'OTP sent to your email', role: assignedRole });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ─── POST /api/auth/verify-otp ──────────────────────────────────────────────
// Admin verifies OTP → account activated → JWT returned
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: 'Email and OTP are required' });

    const record = await OTP.findOne({ email });
    if (!record)
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });

    const isMatch = await bcrypt.compare(otp, record.otp);
    if (!isMatch)
      return res.status(400).json({ message: 'Incorrect OTP. Please try again.' });

    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );

    await OTP.deleteMany({ email });

    res.json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    console.error('VerifyOTP error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ─── POST /api/auth/resend-otp ──────────────────────────────────────────────
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email, isVerified: false });
    if (!user)
      return res.status(400).json({ message: 'No pending verification for this email.' });

    await OTP.deleteMany({ email });
    const otp = generateOTP();
    await OTP.create({
      email,
      otp: await bcrypt.hash(otp, 10),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendOTPEmail(email, otp);
    res.json({ message: 'New OTP sent' });
  } catch (err) {
    console.error('ResendOTP error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ─── POST /api/auth/login ────────────────────────────────────────────────────
// All roles login here
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: 'Invalid email or password' });

    if (!user.isVerified)
      return res.status(403).json({
        message: 'Email not verified. Please complete OTP verification.',
        needsVerification: true,
      });

    const match = await user.matchPassword(password);
    if (!match)
      return res.status(401).json({ message: 'Invalid email or password' });

    res.json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ─── POST /api/auth/create-staff ────────────────────────────────────────────
// Admin creates cashier or kitchen staff
exports.createStaff = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role)
      return res.status(400).json({ message: 'All fields are required' });

    if (!['cashier', 'kitchen'].includes(role))
      return res.status(400).json({ message: 'Role must be cashier or kitchen' });

    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: 'Email already in use' });

    const staff = await User.create({
      name,
      email,
      password,
      role,
      isVerified: true,      // Admin-created staff skip OTP
      createdBy: req.user._id,
    });

    // Send welcome email with credentials
    await sendWelcomeEmail(email, name, role, password);

    res.status(201).json({
      _id:   staff._id,
      name:  staff.name,
      email: staff.email,
      role:  staff.role,
    });
  } catch (err) {
    console.error('CreateStaff error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ─── GET /api/auth/me ────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
};

// ─── GET /api/auth/staff ─────────────────────────────────────────────────────
// Admin gets list of all staff they created
exports.getStaff = async (req, res) => {
  try {
    const staff = await User.find({ createdBy: req.user._id }).select('-password');
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── DELETE /api/auth/staff/:id ──────────────────────────────────────────────
exports.deleteStaff = async (req, res) => {
  try {
    const staff = await User.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });
    if (staff.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    await User.deleteOne({ _id: req.params.id });
    res.json({ message: 'Staff removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
