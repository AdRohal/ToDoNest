
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');

require('dotenv').config();

const app = express();
// اضبط CORS للسماح فقط للفرونت إند في الإنتاج
app.use(cors({
  origin: [
    'https://todo-nest-brown.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

// إعداد اتصال PostgreSQL باستخدام متغير البيئة DATABASE_URL مع SSL لـ Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Middleware للتحقق من JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
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
  if (!id) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  console.log(`Fetching user with ID: ${id}`);
  try {
    const result = await pool.query('SELECT id, full_name, username, email, avatar FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = result.rows[0];
    // Convert the avatar buffer to a base64 string if it exists
    if (user.avatar) {
      user.avatar = user.avatar.toString('base64');
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

  // Check if all fields are provided
  if (!full_name || !username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    // Convert email to lowercase
    const lowerCaseEmail = email.toLowerCase();

    // Check if email is already registered
    const emailExists = await pool.query('SELECT * FROM users WHERE email = $1', [lowerCaseEmail]);
    if (emailExists.rows.length > 0) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    // Check if username is already taken
    const usernameExists = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (usernameExists.rows.length > 0) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    // Register the user
    const result = await pool.query(
      'INSERT INTO users (full_name, username, email, password) VALUES ($1, $2, $3, $4) RETURNING id',
      [full_name, username, lowerCaseEmail, hashedPassword]
    );
    const user = result.rows[0];

    // Create a JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
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
      result = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [identifier]);
    } else {
      result = await pool.query('SELECT * FROM users WHERE username = $1', [identifier]);
    }
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const user = result.rows[0];
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
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
      return res.status(400).json({ error: 'At least one field is required' });
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

// Endpoint to create a new category
app.post('/api/category', authenticateToken, async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;

  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO categories (name, user_id) VALUES ($1, $2) RETURNING id, name',
      [name, userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(500).json({ error: 'An error occurred. Please try again.' });
  }
});

// Endpoint to update category name
app.put('/api/category/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const userId = req.user.id;

  console.log(`Updating category ${id} to ${name} for user ${userId}`); // Add logging

  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  try {
    const result = await pool.query(
      'UPDATE categories SET name = $1 WHERE id = $2 AND user_id = $3 RETURNING id, name',
      [name, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    console.log('Update result:', result.rows[0]); // Add logging

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({ error: 'An error occurred. Please try again.' });
  }
});

// Endpoint to create a new task
app.post('/api/task', authenticateToken, async (req, res) => {
  const { categoryId, title, description } = req.body;
  const userId = req.user.id;

  if (!categoryId || !title) {
    return res.status(400).json({ error: 'Category ID and title are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO tasks (category_id, title, description, user_id) VALUES ($1, $2, $3, $4) RETURNING id, title, description, completed',
      [categoryId, title, description, userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'An error occurred. Please try again.' });
  }
});

// Endpoint to fetch categories with tasks
app.get('/api/categories', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(`
      SELECT c.id AS category_id, c.name AS category_name, t.id AS task_id, t.title AS task_title, t.description AS task_description, t.completed AS task_completed
      FROM categories c
      LEFT JOIN tasks t ON c.id = t.category_id
      WHERE c.user_id = $1
    `, [userId]);

    const categories = result.rows.reduce((acc, row) => {
      const category = acc.find(c => c.id === row.category_id);
      if (category) {
        if (row.task_id) {
          category.tasks.push({
            id: row.task_id,
            title: row.task_title,
            description: row.task_description,
            completed: row.task_completed
          });
        }
      } else {
        acc.push({
          id: row.category_id,
          name: row.category_name,
          tasks: row.task_id ? [{
            id: row.task_id,
            title: row.task_title,
            description: row.task_description,
            completed: row.task_completed
          }] : []
        });
      }
      return acc;
    }, []);

    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'An error occurred. Please try again.' });
  }
});

// Endpoint to toggle task completion
app.put('/api/task/:id/completion', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  try {
    const result = await pool.query(
      'UPDATE tasks SET completed = $1 WHERE id = $2 RETURNING id, title, description, completed',
      [completed, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error toggling task:', err);
    res.status(500).json({ error: 'An error occurred. Please try again.' });
  }
});

// Endpoint to delete a category
app.delete('/api/category/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Delete tasks associated with the category
    await pool.query('DELETE FROM tasks WHERE category_id = $1 AND user_id = $2', [id, userId]);

    // Delete the category
    const result = await pool.query('DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category and associated tasks deleted successfully' });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ error: 'An error occurred. Please try again.' });
  }
});

// Endpoint to update task title, description, and completion status
app.put('/api/task/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;

  if (title === undefined && description === undefined && completed === undefined) {
    return res.status(400).json({ error: 'At least one of title, description, or completed is required' });
  }

  try {
    const updateFields = [];
    const updateValues = [];
    let queryIndex = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${queryIndex++}`);
      updateValues.push(title);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${queryIndex++}`);
      updateValues.push(description);
    }
    if (completed !== undefined) {
      updateFields.push(`completed = $${queryIndex++}`);
      updateValues.push(completed);
    }

    updateValues.push(id);
    const updateQuery = `
      UPDATE tasks
      SET ${updateFields.join(', ')}
      WHERE id = $${queryIndex}
      RETURNING id, title, description, completed
    `;

    console.log('Update Query:', updateQuery); // Debugging log
    console.log('Update Values:', updateValues); // Debugging log

    const result = await pool.query(updateQuery, updateValues);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'An error occurred. Please try again.' });
  }
});


// Endpoint to delete a task
app.delete('/api/task/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Ensure the task belongs to the user before deleting
    const taskResult = await pool.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [id, userId]);

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found or does not belong to the user' });
    }

    const deleteResult = await pool.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'An error occurred. Please try again.' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});