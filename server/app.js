require('dotenv').config({ path: '.env' });
const express = require('express');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const flash = require('express-flash');

const app = express();
const port = process.env.PORT || 3000;
const path = require ('path');
const boStaffRolesRouter = require('./routes/staffRoles');

const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const staffRouter = require('./routes/staff');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);
app.set('layout', 'layouts/empty-layout.ejs'); // default layout

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'session', // matches your table definition
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
  }
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user && req.session.user.name ? req.session.user.name : null;
	console.log("REQ_SESSION_USER:", req.session.user);
  next();
});

app.use(flash());
app.set('view engine', 'html');

app.use(express.static('./public/'));
app.set('views', __dirname + '/views')
app.engine('html', require('ejs').renderFile);
app.use((req, res, next) => {
  const staticFileRegex = /\.(css|js|ico|png|jpg|jpeg|gif|svg|woff2?|ttf|eot|map)$/i;

  // Only assign currentPage if not a static file
  if (!staticFileRegex.test(req.path)) {
    res.locals.currentPage = req.path || '/';
  }
	else {
		res.locals.currentPage = "";
	}

	console.log(res.locals.currentPage);

  next();
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
const rolesRouter = require('./routes/roles');

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/bo/staff', staffRouter);
app.use('/admin', adminRouter);
app.use('/auth', authRoutes);
app.use('/clients', clientRoutes);
app.use('/employees', employeeRoutes);
app.use('/bo/shipments', shipmentRoutes);
app.use('/bo/reports', reportRoutes);
app.use('/bo/staff-roles', boStaffRolesRouter);
app.use('/bo/roles', rolesRouter);
app.use('/bo/offices', officeRoutes);

app.get('/bo', (req, res) => {
  res.redirect('/bo/staff');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
