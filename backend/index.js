const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'todonest',
  password: '5233',
  port: 5432,
});

app.get('/api/user/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`Fetching user with ID: ${id}`);
  try {
    const result = await pool.query('SELECT id, full_name, username, email FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      console.log('User not found');
      return res.status(404).json({ error: 'User not found' });
    }
    const user = result.rows[0];
    console.log('User fetched:', user);
    res.json({ user });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'An error occurred. Please try again.' });
  }
});

app.post('/api/register', async (req, res) => {
  const { full_name, username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    const usernameExists = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (usernameExists.rows.length > 0) {
      return res.status(400).json({ error: 'Username already taken' });
    }
    const result = await pool.query(
      'INSERT INTO users (full_name, username, email, password) VALUES ($1, $2, $3, $4) RETURNING id',
      [full_name, username, email, hashedPassword]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id }, 'your_jwt_secret', { expiresIn: '1h' });
    res.status(201).json({ token, userId: user.id });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'An error occurred. Please try again.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { identifier, password } = req.body; // Changed from email to identifier
  console.log(`Login attempt with identifier: ${identifier}`);
  try {
    let result;
    if (identifier.includes('@')) {
      // Assume it's an email
      result = await pool.query('SELECT id, password FROM users WHERE email = $1', [identifier]);
    } else {
      // Assume it's a username
      result = await pool.query('SELECT id, password FROM users WHERE username = $1', [identifier]);
    }
    console.log(`Query result: ${JSON.stringify(result.rows)}`);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }
    const user = result.rows[0];
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});