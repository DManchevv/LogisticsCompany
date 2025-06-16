// Load environment variables from .env file
require('dotenv').config({ path: '.env' });

// Import required modules
const express = require('express'); // Express framework
const flash = require('express-flash'); // For flash messages

const app = express(); // Initialize Express app
const port = process.env.PORT || 3000; // Define port to listen on, from env or default to 3000
const path = require('path'); // Node.js module for handling file paths

// Import custom routers
const session = require('express-session'); // Session middleware
const pgSession = require('connect-pg-simple')(session); // PostgreSQL session store
const staffRouter = require('./routes/staff'); // Staff-related routes

// Initialize PostgreSQL connection pool using environment variables

// Set up EJS layout support
const expressLayouts = require('express-ejs-layouts');

const { pool } = require('./dbUtils'); // Get client DB connection

app.use(expressLayouts);
app.set('layout', 'layouts/empty-layout.ejs'); // Default layout template

// Middleware to parse URL-encoded and JSON request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set up session middleware with PostgreSQL session store
app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'session', // PostgreSQL table to store session data
  }),
  secret: process.env.SESSION_SECRET, // Session secret key
  resave: false, // Do not save session if unmodified
  saveUninitialized: false, // Do not create session until something is stored
  cookie: {
    maxAge: 8 * 60 * 60 * 1000, // Session expires after 8 hours
  }
}));

// Middleware to expose the currently logged-in user's name to templates
app.use((req, res, next) => {
  res.locals.user = req.session.user && req.session.user.name ? req.session.user.name : null;
  next();
});

// Flash middleware for storing temporary messages (e.g., errors, success notices)
app.use(flash());

// Set up EJS as the view engine (render .html files using EJS)
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

// Serve static files (CSS, JS, images, etc.) from the 'public' folder
app.use(express.static('./public/'));

// Set views directory for templates
app.set('views', __dirname + '/views');

// Middleware to track the current page, excluding static asset requests
app.use((req, res, next) => {
  const staticFileRegex = /\.(css|js|ico|png|jpg|jpeg|gif|svg|woff2?|ttf|eot|map)$/i;

  if (!staticFileRegex.test(req.path)) {
    res.locals.currentPage = req.path || '/';
  } else {
    res.locals.currentPage = "";
  }

  next();
});

// Route imports (modularized routes for clean structure)
const authRouter = require('./routes/auth');
const boStaffRolesRouter = require('./routes/staffRoles');
const clientRouter = require('./routes/clients');
const officeRouter = require('./routes/offices');
const shipmentRouter = require('./routes/shipments');
const reportRouter = require('./routes/reports');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const rolesRouter = require('./routes/roles');

// Mount routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/bo/staff', staffRouter);
app.use('/auth', authRouter);
app.use('/clients', clientRouter);
app.use('/bo/shipments', shipmentRouter);
app.use('/bo/reports', reportRouter);
app.use('/bo/staff-roles', boStaffRolesRouter);
app.use('/bo/roles', rolesRouter);
app.use('/bo/offices', officeRouter);
app.use('/bo/users', usersRouter); // This seems duplicated; consider reviewing it

// Redirect base back-office route to the staff management page
app.get('/bo', (req, res) => {
  res.redirect('/bo/staff');
});

// If the route is not recognized by the app, send http status 404 NOT FOUND
app.use((req,res,next) => {
	res.sendStatus(404);
});

// Start the server and listen on the defined port
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
