const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"UrbanPlate" <${process.env.EMAIL_USER}>`,
      to, subject, html,
    });
  } catch (err) {
    console.log('Email error:', err.message);
  }
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// @POST /api/auth/register/customer
const registerCustomer = async (req, res) => {
  try {
    const { username, email, password, name, mobile, address } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Email or username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      username, email,
      password: hashedPassword,
      name, mobile, address,
      role: 'CUSTOMER',
      verified: false,
      verificationToken,
    });

    // Send verification email
    const verifyUrl = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${verificationToken}`;
    await sendEmail(email, 'Verify Your Email — UrbanPlate', `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#FF6B35">🍽️ Welcome to UrbanPlate!</h2>
        <p>Hi ${name}, please verify your email to complete registration.</p>
        <a href="${verifyUrl}" style="background:#FF6B35;color:white;padding:12px 24px;
          border-radius:8px;text-decoration:none;display:inline-block;margin:16px 0">
          Verify Email
        </a>
        <p style="color:#888;font-size:12px">If you didn't register, ignore this email.</p>
      </div>
    `);

    res.status(201).json({
      message: 'Registration successful! Please check your email to verify your account.',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/auth/register/staff
const registerStaff = async (req, res) => {
  try {
    const { username, email, password, name, mobile, jobRole, department } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Email or username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      username, email,
      password: hashedPassword,
      name, mobile, jobRole, department,
      role: 'STAFF',
      verified: false,
      approved: false,
      verificationToken,
    });

    // Send verification email to staff
    const verifyUrl = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${verificationToken}`;
    await sendEmail(email, 'Verify Your Email — UrbanPlate Staff', `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#FF6B35">🍽️ UrbanPlate Staff Registration</h2>
        <p>Hi ${name}, please verify your email first.</p>
        <p>After verification, your account will be reviewed by an admin before you can login.</p>
        <a href="${verifyUrl}" style="background:#FF6B35;color:white;padding:12px 24px;
          border-radius:8px;text-decoration:none;display:inline-block;margin:16px 0">
          Verify Email
        </a>
      </div>
    `);

    // Notify admin about new staff registration
    const admins = await User.find({ role: 'ADMIN' });
    for (const admin of admins) {
      await sendEmail(admin.email, 'New Staff Registration — UrbanPlate', `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <h2 style="color:#FF6B35">New Staff Registration</h2>
          <p>A new staff member has registered and needs your approval:</p>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px;color:#888">Name</td><td style="padding:8px">${name}</td></tr>
            <tr><td style="padding:8px;color:#888">Email</td><td style="padding:8px">${email}</td></tr>
            <tr><td style="padding:8px;color:#888">Job Role</td><td style="padding:8px">${jobRole || 'Not specified'}</td></tr>
            <tr><td style="padding:8px;color:#888">Department</td><td style="padding:8px">${department || 'Not specified'}</td></tr>
          </table>
          <p>Please login to the admin panel to approve or reject this application.</p>
        </div>
      `);
    }

    res.status(201).json({
      message: 'Staff registration submitted! Please verify your email. Your account will be reviewed by an admin.',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/auth/verify-email?token=xxx
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).send(`
        <html><body style="font-family:Arial;text-align:center;padding:50px">
          <h2 style="color:red">❌ Invalid or expired verification link</h2>
        </body></html>
      `);
    }

    user.verified = true;
    user.verificationToken = null;
    await user.save();

    const message = user.role === 'STAFF'
      ? 'Email verified! Your account is pending admin approval. You will be notified once approved.'
      : 'Email verified successfully! You can now login.';

    res.send(`
      <html><body style="font-family:Arial;text-align:center;padding:50px">
        <h2 style="color:#FF6B35">✅ ${message}</h2>
        <p>You can close this window and return to the app.</p>
      </body></html>
    `);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

// @POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    if (!user.verified) {
      return res.status(403).json({ message: 'Please verify your email before logging in' });
    }

    if (user.role === 'STAFF' && !user.approved) {
      return res.status(403).json({ message: 'Your account is pending admin approval' });
    }

    if (!user.enabled) {
      return res.status(403).json({ message: 'Your account has been disabled' });
    }

    const token = generateToken(user);
    res.json({ token, role: user.role, userId: user._id, name: user.name });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with this email' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.BACKEND_URL}/api/auth/reset-password-page?token=${resetToken}`;
    await sendEmail(email, 'Reset Your Password — UrbanPlate', `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#FF6B35">🔐 Reset Your Password</h2>
        <p>Hi ${user.name}, click below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="background:#FF6B35;color:white;padding:12px 24px;
          border-radius:8px;text-decoration:none;display:inline-block;margin:16px 0">
          Reset Password
        </a>
        <p style="color:#888;font-size:12px">If you didn't request this, ignore this email.</p>
      </div>
    `);

    res.json({ message: 'Password reset link sent to your email' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/auth/reset-password-page?token=xxx
const resetPasswordPage = (req, res) => {
  const { token } = req.query;
  res.send(`
    <html>
    <body style="font-family:Arial;max-width:400px;margin:50px auto;padding:20px">
      <h2 style="color:#FF6B35">🍽️ Reset Password</h2>
      <form action="/api/auth/reset-password" method="POST">
        <input type="hidden" name="token" value="${token}"/>
        <div style="margin-bottom:16px">
          <label style="display:block;margin-bottom:6px">New Password</label>
          <input type="password" name="newPassword" required
            style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:16px"/>
        </div>
        <button type="submit"
          style="background:#FF6B35;color:white;padding:12px 24px;border:none;
          border-radius:8px;font-size:16px;cursor:pointer;width:100%">
          Reset Password
        </button>
      </form>
    </body>
    </html>
  `);
};

// @POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.send(`
        <html><body style="font-family:Arial;text-align:center;padding:50px">
          <h2 style="color:red">❌ Reset link is invalid or has expired</h2>
        </body></html>
      `);
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.send(`
      <html><body style="font-family:Arial;text-align:center;padding:50px">
        <h2 style="color:#FF6B35">✅ Password reset successfully!</h2>
        <p>You can now login with your new password.</p>
      </body></html>
    `);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

// @GET /api/auth/pending-staff (Admin only)
const getPendingStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: 'STAFF', verified: true, approved: false })
      .select('-password');
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/auth/approve-staff/:id (Admin only)
const approveStaff = async (req, res) => {
  try {
    const { approved, note } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.approved = approved;
    user.enabled = approved;
    await user.save();

    const subject = approved
      ? 'Your Staff Account is Approved — UrbanPlate'
      : 'Your Staff Application — UrbanPlate';

    const html = approved ? `
      <div style="font-family:Arial;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#FF6B35">✅ Account Approved!</h2>
        <p>Hi ${user.name}, your staff account has been approved. You can now login.</p>
      </div>
    ` : `
      <div style="font-family:Arial;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#c62828">❌ Application Not Approved</h2>
        <p>Hi ${user.name}, unfortunately your staff application was not approved.</p>
        ${note ? `<p>Reason: ${note}</p>` : ''}
      </div>
    `;

    await sendEmail(user.email, subject, html);
    res.json({ message: `Staff ${approved ? 'approved' : 'rejected'} successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  registerCustomer, registerStaff, verifyEmail,
  login, forgotPassword, resetPasswordPage,
  resetPassword, getPendingStaff, approveStaff,
};