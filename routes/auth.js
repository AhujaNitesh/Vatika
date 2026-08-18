const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');

const { getPool, checkConnection } = require('../config/db');
const { loadMockDataFromSql } = require('../config/mock-db');
const { sendPasswordResetEmail } = require('../services/emailService');
const { verifyToken, JWT_SECRET } = require('../middleware/authMiddleware');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'dummy_client_id');

// In-memory user store fallback if MySQL is offline during local dev
const mockUsers = [];

// Helper: Generate JWT session token
function generateToken(user) {
  return jwt.sign(
    {
      user_id: user.user_id || user.id,
      email: user.email,
      username: user.username,
      role: user.role || 'student'
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register — Create User Account
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password, username, user_role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanRole = user_role || 'student';
    const cleanFullName = full_name || cleanEmail.split('@')[0];
    const generatedUsername = username || cleanEmail.split('@')[0] + '_' + Math.floor(Math.random() * 1000);

    const isConnected = await checkConnection();

    if (isConnected) {
      const pool = getPool();

      // Check existing email/username
      const [existing] = await pool.query(
        'SELECT user_id FROM User WHERE email = ? OR username = ?',
        [cleanEmail, generatedUsername]
      );

      if (existing.length > 0) {
        return res.status(409).json({ status: 'error', message: 'An account with this email address already exists. Please sign in instead.' });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const [result] = await pool.query(
        'INSERT INTO User (username, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)',
        [generatedUsername, cleanEmail, passwordHash, cleanFullName, cleanRole]
      );

      const newUser = {
        user_id: result.insertId,
        username: generatedUsername,
        email: cleanEmail,
        full_name: cleanFullName,
        role: cleanRole
      };

      const token = generateToken(newUser);

      return res.status(201).json({
        status: 'success',
        message: 'Account created successfully!',
        token,
        user: newUser
      });

    } else {
      // In-Memory Fallback when DB is offline
      const existing = mockUsers.find(u => u.email === cleanEmail);
      if (existing) {
        return res.status(409).json({ status: 'error', message: 'An account with this email address already exists.' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = {
        user_id: mockUsers.length + 1,
        username: generatedUsername,
        email: cleanEmail,
        password_hash: passwordHash,
        full_name: cleanFullName,
        role: cleanRole
      };
      mockUsers.push(newUser);

      const token = generateToken(newUser);

      return res.status(201).json({
        status: 'success',
        message: 'Account created (In-Memory)!',
        token,
        user: { user_id: newUser.user_id, username: newUser.username, email: newUser.email, full_name: newUser.full_name, role: newUser.role }
      });
    }

  } catch (err) {
    console.error('[Register Error]', err);
    return res.status(500).json({ status: 'error', message: 'Failed to create account: ' + err.message });
  }
});

// POST /api/auth/login — Authenticate User
router.post('/login', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const loginIdentifier = (email || username || '').trim().toLowerCase();

    if (!loginIdentifier || !password) {
      return res.status(400).json({ status: 'error', message: 'Email/Username and password are required' });
    }

    const isConnected = await checkConnection();

    if (isConnected) {
      const pool = getPool();
      const [rows] = await pool.query(
        'SELECT * FROM User WHERE email = ? OR username = ?',
        [loginIdentifier, loginIdentifier]
      );

      if (rows.length === 0) {
        return res.status(401).json({ status: 'error', message: 'Invalid credentials. User not found.' });
      }

      const user = rows[0];

      if (!user.password_hash) {
        return res.status(401).json({ status: 'error', message: 'This account uses Google Sign-In. Please click "Sign in with Google".' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ status: 'error', message: 'Invalid password. Please check your details and try again.' });
      }

      const cleanUser = {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        full_name: user.full_name || user.username,
        role: user.role || 'student'
      };

      const token = generateToken(cleanUser);

      return res.json({
        status: 'success',
        message: 'Signed in successfully!',
        token,
        user: cleanUser
      });

    } else {
      // In-Memory Fallback
      const user = mockUsers.find(u => u.email === loginIdentifier || u.username === loginIdentifier);
      if (!user || !user.password_hash) {
        return res.status(401).json({ status: 'error', message: 'Invalid credentials or user not found.' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ status: 'error', message: 'Invalid password.' });
      }

      const cleanUser = {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      };

      const token = generateToken(cleanUser);

      return res.json({
        status: 'success',
        message: 'Signed in successfully!',
        token,
        user: cleanUser
      });
    }

  } catch (err) {
    console.error('[Login Error]', err);
    return res.status(500).json({ status: 'error', message: 'Login failed: ' + err.message });
  }
});

// POST /api/auth/google — Google OAuth Authentication Endpoint
router.post('/google', async (req, res) => {
  try {
    const { credential, g_email, g_name, g_sub } = req.body;
    let googleUser = null;

    if (credential) {
      try {
        // Attempt token verification if GOOGLE_CLIENT_ID is configured
        if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'dummy_client_id') {
          const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
          });
          const payload = ticket.getPayload();
          googleUser = {
            sub: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture
          };
        } else {
          // Decode payload for frontend developer preview / client-side Google token
          const decoded = jwt.decode(credential);
          if (decoded && decoded.email) {
            googleUser = {
              sub: decoded.sub || decoded.email,
              email: decoded.email,
              name: decoded.name || decoded.email.split('@')[0],
              picture: decoded.picture
            };
          }
        }
      } catch (err) {
        console.warn('[Google Auth] Token verify warning, using fallback credentials:', err.message);
      }
    }

    if (!googleUser && g_email) {
      googleUser = {
        sub: g_sub || g_email,
        email: g_email,
        name: g_name || g_email.split('@')[0]
      };
    }

    if (!googleUser || !googleUser.email) {
      return res.status(400).json({ status: 'error', message: 'Unable to verify Google credentials' });
    }

    const cleanEmail = googleUser.email.trim().toLowerCase();
    const googleId = googleUser.sub;
    const fullName = googleUser.name || cleanEmail.split('@')[0];
    const generatedUsername = cleanEmail.split('@')[0] + '_g';

    const isConnected = await checkConnection();

    if (isConnected) {
      const pool = getPool();

      // Find user by google_id or email
      let [rows] = await pool.query(
        'SELECT * FROM User WHERE google_id = ? OR email = ?',
        [googleId, cleanEmail]
      );

      let user = null;

      if (rows.length > 0) {
        user = rows[0];
        // Link google_id if not linked
        if (!user.google_id) {
          await pool.query('UPDATE User SET google_id = ? WHERE user_id = ?', [googleId, user.user_id]);
          user.google_id = googleId;
        }
      } else {
        // Create new user for Google Sign-In
        const [result] = await pool.query(
          'INSERT INTO User (username, email, google_id, full_name, role) VALUES (?, ?, ?, ?, ?)',
          [generatedUsername, cleanEmail, googleId, fullName, 'student']
        );
        user = {
          user_id: result.insertId,
          username: generatedUsername,
          email: cleanEmail,
          google_id: googleId,
          full_name: fullName,
          role: 'student'
        };
      }

      const cleanUser = {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        full_name: user.full_name || fullName,
        role: user.role || 'student'
      };

      const token = generateToken(cleanUser);

      return res.json({
        status: 'success',
        message: 'Google Sign-In successful!',
        token,
        user: cleanUser
      });

    } else {
      // In-Memory Fallback
      let user = mockUsers.find(u => u.google_id === googleId || u.email === cleanEmail);
      if (!user) {
        user = {
          user_id: mockUsers.length + 1,
          username: generatedUsername,
          email: cleanEmail,
          google_id: googleId,
          full_name: fullName,
          role: 'student'
        };
        mockUsers.push(user);
      }

      const token = generateToken(user);
      return res.json({
        status: 'success',
        message: 'Google Sign-In successful (In-Memory)!',
        token,
        user: { user_id: user.user_id, username: user.username, email: user.email, full_name: user.full_name, role: user.role }
      });
    }

  } catch (err) {
    console.error('[Google Sign-In Error]', err);
    return res.status(500).json({ status: 'error', message: 'Google Sign-In failed: ' + err.message });
  }
});

// POST /api/auth/forgot-password — Send Password Reset Email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ status: 'error', message: 'Account email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const isConnected = await checkConnection();

    // Generate secure token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hostUrl = `${req.protocol}://${req.get('host')}`;

    if (isConnected) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT user_id, username, email FROM User WHERE email = ?', [cleanEmail]);

      if (rows.length === 0) {
        // Return friendly response to prevent email enumeration
        return res.json({
          status: 'success',
          message: 'If an account exists with this email, password reset instructions have been sent.'
        });
      }

      const user = rows[0];

      // Update reset token & 1 hour expiry
      await pool.query(
        'UPDATE User SET reset_token = ?, reset_token_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE user_id = ?',
        [resetToken, user.user_id]
      );

      const emailResult = await sendPasswordResetEmail(cleanEmail, resetToken, hostUrl);

      return res.json({
        status: 'success',
        message: 'Password reset instructions have been sent to your email address.',
        previewUrl: emailResult.previewUrl
      });

    } else {
      // In-Memory Fallback
      const user = mockUsers.find(u => u.email === cleanEmail);
      if (user) {
        user.reset_token = resetToken;
        user.reset_token_expires = Date.now() + 3600000;
      }
      const emailResult = await sendPasswordResetEmail(cleanEmail, resetToken, hostUrl);
      return res.json({
        status: 'success',
        message: 'Password reset instructions sent (In-Memory)!',
        previewUrl: emailResult.previewUrl
      });
    }

  } catch (err) {
    console.error('[Forgot Password Error]', err);
    return res.status(500).json({ status: 'error', message: 'Failed to process password reset: ' + err.message });
  }
});

// POST /api/auth/reset-password — Reset Password with Token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ status: 'error', message: 'Reset token and new password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ status: 'error', message: 'Password must be at least 6 characters long' });
    }

    const isConnected = await checkConnection();

    if (isConnected) {
      const pool = getPool();
      const [rows] = await pool.query(
        'SELECT user_id, email FROM User WHERE reset_token = ? AND reset_token_expires > NOW()',
        [token]
      );

      if (rows.length === 0) {
        return res.status(400).json({ status: 'error', message: 'Invalid or expired password reset token. Please request a new reset link.' });
      }

      const user = rows[0];
      const newHash = await bcrypt.hash(password, 10);

      await pool.query(
        'UPDATE User SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE user_id = ?',
        [newHash, user.user_id]
      );

      return res.json({
        status: 'success',
        message: 'Your password has been updated successfully! You can now sign in.'
      });

    } else {
      // In-Memory Fallback
      const user = mockUsers.find(u => u.reset_token === token && u.reset_token_expires > Date.now());
      if (!user) {
        return res.status(400).json({ status: 'error', message: 'Invalid or expired reset token.' });
      }

      user.password_hash = await bcrypt.hash(password, 10);
      user.reset_token = null;
      user.reset_token_expires = null;

      return res.json({
        status: 'success',
        message: 'Your password has been updated successfully!'
      });
    }

  } catch (err) {
    console.error('[Reset Password Error]', err);
    return res.status(500).json({ status: 'error', message: 'Failed to reset password: ' + err.message });
  }
});

// GET /api/auth/me — Get Logged-in User Session Details
router.get('/me', verifyToken, async (req, res) => {
  try {
    const isConnected = await checkConnection();
    if (isConnected) {
      const pool = getPool();
      const [rows] = await pool.query(
        'SELECT user_id, username, email, full_name, role, created_at FROM User WHERE user_id = ?',
        [req.user.user_id]
      );

      if (rows.length === 0) {
        return res.status(444).json({ status: 'error', message: 'User not found' });
      }

      return res.json({ status: 'success', user: rows[0] });
    } else {
      return res.json({ status: 'success', user: req.user });
    }
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;
