const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL connection configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'todonest',
  password: '5233',
  port: 5432,
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, 'your_jwt_secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Multer storage configuration to handle avatar uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Endpoint to fetch a user by ID
app.get('/api/user/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  console.log(`Fetching user with ID: ${id}`);
  try {
    const result = await pool.query('SELECT id, full_name, username, email, avatar FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      console.log('User not found');
      return res.status(404).json({ error: 'User not found' });
    }
    const user = result.rows[0];
    // Convert the avatar buffer to a base64 string
    if (user.avatar) {
      user.avatar = user.avatar.toString('base64'); // Convert buffer to base64
    }
    console.log('User fetched:', user);
    res.json({ user });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'An error occurred. Please try again.' });
  }
});

// Endpoint to register a new user
app.post('/api/register', async (req, res) => {
  const { full_name, username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    // Check if email is already registered
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    // Check if username is already taken
    const usernameExists = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (usernameExists.rows.length > 0) {
      return res.status(400).json({ error: 'Username already taken' });
    }
    // Register the user
    const result = await pool.query(
      'INSERT INTO users (full_name, username, email, password) VALUES ($1, $2, $3, $4) RETURNING id',
      [full_name, username, email, hashedPassword]
    );
    const user = result.rows[0];
    // Create a JWT token
    const token = jwt.sign({ id: user.id }, 'your_jwt_secret', { expiresIn: '1h' });
    res.status(201).json({ token, userId: user.id });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'An error occurred. Please try again.' });
  }
});

// Endpoint to login a user
app.post('/api/login', async (req, res) => {
  const { identifier, password } = req.body; // identifier can be email or username
  console.log(`Login attempt with identifier: ${identifier}`);
  try {
    let result;
    if (identifier.includes('@')) {
      // Login by email
      result = await pool.query('SELECT id, password FROM users WHERE email = $1', [identifier]);
    } else {
      // Login by username
      result = await pool.query('SELECT id, password FROM users WHERE username = $1', [identifier]);
    }
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }
    const user = result.rows[0];
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id }, 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ token, userId: user.id });
  } catch (err) {
    console.error('Error logging in user:', err);
    res.status(500).json({ error: 'An error occurred. Please try again.' });
  }
});

// Endpoint to update user profile
app.put('/api/user/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { full_name, username, email } = req.body;
  console.log(`Updating user with ID: ${id}`);
  try {
    const userExists = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userExists.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updateFields = [];
    const updateValues = [];
    let queryIndex = 1;

    if (full_name) {
      updateFields.push(`full_name = $${queryIndex++}`);
      updateValues.push(full_name);
    }
    if (username) {
      updateFields.push(`username = $${queryIndex++}`);
      updateValues.push(username);
    }
    if (email) {
      updateFields.push(`email = $${queryIndex++}`);
      updateValues.push(email);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateValues.push(id);
    const updateQuery = `
      UPDATE users
      SET ${updateFields.join(', ')}
      WHERE id = $${queryIndex}
    `;
    await pool.query(updateQuery, updateValues);

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'An error occurred. Please try again.' });
  }
});

// Update avatar
app.post('/api/user/:id/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  const { id } = req.params;
  const avatar = req.file ? req.file.buffer : null;

  console.log(`Updating avatar for user with ID: ${id}`);
  if (avatar) {
    console.log(`Avatar uploaded: ${req.file.originalname}`);
  } else {
    console.log('No avatar uploaded');
    return res.status(400).json({ error: 'No avatar uploaded' });
  }

  try {
    const userExists = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userExists.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updateQuery = `
      UPDATE users
      SET avatar = $1
      WHERE id = $2
    `;

    // Convert buffer to an appropriate format if necessary
    await pool.query(updateQuery, [avatar, id]);

    res.status(200).json({ message: 'Avatar updated successfully' });
  } catch (err) {
    console.error('Error updating avatar:', err);
    res.status(500).json({ error: 'An error occurred. Please try again.' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});