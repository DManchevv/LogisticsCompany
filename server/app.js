const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const flash = require('express-flash');

const app = express();
const port = process.env.PORT || 3000;
const path = require ('path');

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || "secretKey",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.set('view engine', 'html');

app.use(express.static('./public/'));
app.set('views', __dirname + '/views')
app.engine('html', require('ejs').renderFile);
app.use((req, res, next) => {
  res.locals.currentPage = req.path.split('/')[1] || 'home';
  next();
});

// Passport configuration
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
      if (userResult.rows.length === 0) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      
      const user = userResult.rows[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, userResult.rows[0]);
  } catch (err) {
    done(err);
  }
});

// Routes
const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const employeeRoutes = require('./routes/employees');
const officeRoutes = require('./routes/offices');
const shipmentRoutes = require('./routes/shipments');
const reportRoutes = require('./routes/reports');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);
app.use('/auth', authRoutes);
app.use('/clients', clientRoutes);
app.use('/employees', employeeRoutes);
app.use('/offices', officeRoutes);
app.use('/shipments', shipmentRoutes);
app.use('/reports', reportRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
