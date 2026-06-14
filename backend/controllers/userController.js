const bcrypt = require('bcryptjs');
const db = require('../config/db');

function generateTempPassword() {
  return Math.random().toString(36).slice(-8);
}

exports.createUser = async (req, res) => {
  const { name, email, role } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Bad Request', message: 'Name, email, and role are required' });
  }

  const validRoles = ['Admin', 'Project Manager', 'Collaborator'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Bad Request', message: 'Invalid role' });
  }

  const tempPassword = generateTempPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  db.query(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, hashedPassword, role],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'Bad Request', message: 'Email already exists' });
        }
        return res.status(500).json({ error: 'Internal Server Error', message: err.message });
      }

      console.log(`Temp password for ${email}: ${tempPassword}`);
      res.status(201).json({ message: 'User created successfully', userId: result.insertId });
    }
  );
};

exports.getUsers = (req, res) => {
  db.query('SELECT id, name, email, role, is_active, created_at FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: 'Internal Server Error', message: err.message });
    res.json(results);
  });
};

exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  db.query(
    'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
    [name, email, role, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Internal Server Error', message: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Not Found', message: 'User not found' });
      res.json({ message: 'User updated successfully' });
    }
  );
};

exports.deactivateUser = (req, res) => {
  const { id } = req.params;

  db.query('UPDATE users SET is_active = 0 WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Internal Server Error', message: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not Found', message: 'User not found' });
    res.json({ message: 'User deactivated successfully' });
  });
};