const pool = require('../config/db');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  const { username, password, role, full_name, email, phone, address, position, office_id } = req.body;
  
  try {
    // Хеширане на паролата
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Започване на транзакция
    await pool.query('BEGIN');
    
    // Създаване на потребител
    const userResult = await pool.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id',
      [username, hashedPassword, role]
    );
    
    const userId = userResult.rows[0].id;
    
    // Създаване на клиент или служител според ролята
    if (role === 'client') {
      await pool.query(
        'INSERT INTO clients (user_id, full_name, email, phone, address) VALUES ($1, $2, $3, $4, $5)',
        [userId, full_name, email, phone, address]
      );
    } else if (role === 'employee') {
      await pool.query(
        'INSERT INTO employees (user_id, full_name, position, office_id) VALUES ($1, $2, $3, $4)',
        [userId, full_name, position, office_id]
      );
    }
    
    await pool.query('COMMIT');
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info.message });
    
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.json({ 
        message: 'Login successful', 
        user: { id: user.id, username: user.username, role: user.role } 
      });
    });
  })(req, res, next);
};

exports.logout = (req, res) => {
  req.logout(() => {
    res.json({ message: 'Logout successful' });
  });
};
