// Import database pool and validator
const { pool } = require('../dbUtils');
const validator = require('validator');

/**
 * Handles user registration.
 * Validates input fields, checks for duplicates,
 * and inserts user into the database.
 */
exports.register = async (req, res) => {
  const { firstName, lastName, username, email, password, confirmPassword, phone, address } = req.body;
  const errors = [];

  // Validation of required fields
  if (!firstName) errors.push('First name is required');
  if (!lastName) errors.push('Last name is required');
  if (!username) errors.push('Username is required');
  if (!email) errors.push('Email is required');
  if (!password) errors.push('Password is required');
  if (!confirmPassword) errors.push('Please confirm your password');
  if (!address) errors.push('Address is required');

  // Field format validation
  if (email && !validator.isEmail(email)) errors.push('Invalid email format');
  if (username && !validator.isAlphanumeric(username, 'en-US', { ignore: '_-' })) {
    errors.push('Username can only contain letters, numbers, underscores, and hyphens');
  }
  if (password && password.length < 8) errors.push('Password must be at least 8 characters');
  if (password !== confirmPassword) errors.push('Passwords do not match');

  // If validation errors, redirect with flash messages
  if (errors.length > 0) {
    req.flash('error', errors);
    return res.redirect('/auth/register');
  }

  try {
    // Check for existing username
    const usernameCheck = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (usernameCheck.rows.length > 0) errors.push('Username already in use');

    // Check for existing email
    const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) errors.push('Email already in use');

    // If duplicates found, redirect with errors
    if (errors.length > 0) {
      req.flash('error', errors);
      return res.redirect('/auth/register');
    }

    // TODO: Hash the password before storing in production
    await pool.query(
      `INSERT INTO users (first_name, last_name, username, email, password, phone, address)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [firstName, lastName, username, email, password, phone, address]
    );

    req.flash('success', 'Registration successful! Please log in.');
    res.redirect('/auth/login');

  } catch (err) {
    console.error('Registration error:', err);

    // Handle unique constraint errors gracefully
    let errorMessage = 'Registration failed due to an unexpected error.';
    if (err.code === '23505') { // Postgres unique violation error code
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

/**
 * Handles user login.
 * Verifies credentials and sets user session.
 */
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM check_user_password($1, $2)', [username, password]);

    if (result.rows.length === 0 || result.rows[0].check_user_password === false) {
      req.flash('errors', 'Invalid username or password');
      return res.redirect('/auth/login');
    }

    // Set user session info
    req.session.user = {
      name: username,
      role: 'client',
    };
    res.locals.user = req.session.user;

    req.flash('success', `Welcome back, ${username}!`);
    res.redirect('/');
  } catch (err) {
    console.error('Login error:', err);
    req.flash('errors', 'An error occurred during login. Please try again.');
    res.redirect('/auth/login');
  }
};

/**
 * Handles user logout.
 * Destroys session and clears cookie.
 */

exports.logout = (req, res) => {
  // Set flash before destroying session (optional)
  req.flash('success', 'Successfully logged out.');

  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      // We can't flash error here because session is being destroyed
      return res.redirect('/');
    }

    res.clearCookie('connect.sid');
    // Redirect immediately - flash set before destruction will not survive, so this may not show
    res.redirect('/');
  });
};

