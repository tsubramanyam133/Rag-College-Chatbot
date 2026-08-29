const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { memoryDb } = require('../config/db');

// Ensure a default Admin and Demo Student exist
const ensureDefaultUsers = async () => {
  if (memoryDb.users.length === 0) {
    const adminHashedPassword = await bcrypt.hash('Admin@1234', 10);
    const studentHashedPassword = await bcrypt.hash('Student@1234', 10);

    memoryDb.users.push(
      {
        id: 'usr-admin-01',
        name: 'Campus Administrator',
        email: 'admin@campus.edu',
        password: adminHashedPassword,
        role: 'admin',
        department: 'Administration',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-student-01',
        name: 'Aditya Sharma',
        email: 'student@campus.edu',
        password: studentHashedPassword,
        role: 'student',
        department: 'Computer Science & Engineering',
        createdAt: new Date().toISOString()
      }
    );
    memoryDb.saveSnapshot();
  }
};

ensureDefaultUsers();

exports.register = async (req, res) => {
  try {
    const { name, email, password, role = 'student', department = 'General' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = memoryDb.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'student',
      department: department || 'General',
      createdAt: new Date().toISOString()
    };

    memoryDb.users.push(newUser);
    memoryDb.saveSnapshot();

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = memoryDb.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = memoryDb.users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching user profile' });
  }
};
