const pool = require('../config/db');
const validator = require('validator');

exports.register = async (req, res) => {
  const { firstName, lastName, username, email, password, confirmPassword, phone } = req.body;
  
  // Validation
  const errors = [];
  
  // Required fields
  if (!firstName) errors.push('First name is required');
  if (!lastName) errors.push('Last name is required');
  if (!username) errors.push('Username is required');
  if (!email) errors.push('Email is required');
  if (!password) errors.push('Password is required');
  if (!confirmPassword) errors.push('Please confirm your password');
  
  // Field formats
  if (email && !validator.isEmail(email)) errors.push('Invalid email format');
  if (username && !validator.isAlphanumeric(username, 'en-US', {ignore: '_-'})) {
    errors.push('Username can only contain letters, numbers, underscores and hyphens');
  }
  if (password && password.length < 8) errors.push('Password must be at least 8 characters');
  if (password !== confirmPassword) errors.push('Passwords do not match');
  
  if (errors.length > 0) {
    req.flash('error', errors);
    return res.redirect('/auth/register');
  }
  
  try {
    // Check if username already exists
    const usernameCheck = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (usernameCheck.rows.length > 0) {
      errors.push('Username already in use');
    }
    
    // Check if email already exists
    const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      errors.push('Email already in use');
    }
    
    if (errors.length > 0) {
      req.flash('error', errors);
      return res.redirect('/auth/register');
    }
    
    // Create new user (password will be hashed by database trigger)
    const newUser = await pool.query(
      `INSERT INTO users (first_name, last_name, username, email, password, phone) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, first_name, last_name, email, username`,
      [firstName, lastName, username, email, password, phone]
    );
    
    // Log the user in automatically after registration
    req.login(newUser.rows[0], (err) => {
      if (err) {
        console.error('Login after registration error:', err);
        req.flash('success_msg', 'Registration successful! Please log in');
        return res.redirect('/auth/login');
      }
      return res.redirect('/');
    });
    
  } catch (err) {
    console.error('Registration error:', err);
    
    let errorMessage = 'Registration failed';
    if (err.code === '23505') { // Unique constraint violation
      if (err.constraint === 'users_username_key') {
        errorMessage = 'Username already in use';
      } else if (err.constraint === 'users_email_key') {
        errorMessage = 'Email already in use';
      }
    }
    
    req.flash('error', errorMessage);
    res.redirect('/auth/register');
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM check_user_password($1, $2)',
      [username, password]
    );

    if (result.rows.length === 0) {
      req.flash('error', 'Invalid username or password');
      return res.redirect('/auth/login');
    }

		if (result.rows[0].check_user_password == false) {
			req.flash('error', 'Invalid username or password');
			return res.redirect('/auth/login');
		}

    const user = username;
    req.session.user = user;

		console.log("NEW_USER_IS:", user);

    if (user.role === 'employee') {
      return res.redirect('/');
    } else {
      return res.redirect('/');
    }

  } catch (err) {
    console.error('Login error:', err);
    req.flash('error', 'An error occurred during login');
    res.redirect('/auth/login');
  }
};

// Keep logout function the same
exports.logout = (req, res) => {
	console.log("DESTROYING_SESSION:");
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      // Optionally, flash an error or handle it gracefully
      return res.redirect('/');
    }
    res.clearCookie('connect.sid'); // or whatever your session cookie name is
    res.redirect('/'); // Redirect to home after logout
  });
};
