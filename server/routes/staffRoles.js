// routes/backoffice/staffRoles.js
const express = require('express');
const router = express.Router();
const staffRolesModel = require('../models/staffRolesModel');
const rolesModel = require('../models/role');
const staffModel = require('../models/staff');

router.get('/', async (req, res) => {
  try {
    const assignments = await staffRolesModel.getAll();
    res.render('backoffice/staff-roles/index.ejs', {
      title: 'Staff Roles',
      active: 'staff-roles',
      layout: 'backoffice/layout.ejs',
      assignments,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.get('/add', async (req, res) => {
  try {
    const staff = await staffModel.getAllActiveStaff();
    const roles = await rolesModel.getAllRoles();
    res.render('backoffice/staff-roles/add.ejs', {
      title: 'Assign Role',
      active: 'staff-roles',
      layout: 'backoffice/layout.ejs',
      staff,
      roles,
      errors: null,
      formData: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.post('/add', async (req, res) => {
  const { staff_id, role_id } = req.body;

  if (!staff_id || !role_id) {
    const staff = await staffModel.getAllActiveStaff();
    const roles = await rolesModel.getAllRoles();
    return res.render('backoffice/staff-roles/add.ejs', {
      title: 'Assign Role',
      active: 'staff-roles',
		  layout: 'backoffice/layout.ejs',
      staff,
      roles,
      errors: [{ msg: 'Both fields are required.' }],
      formData: req.body
    });
  }

  try {
    await staffRolesModel.assignRole(staff_id, role_id);
    req.flash('success', 'Role assigned successfully');
    res.redirect('/bo/staff-roles');
  } catch (err) {
    console.error(err);
    const staff = await staffModel.getAllActiveStaff();
    const roles = await rolesModel.getAllRoles();
    res.render('backoffice/staff-roles/add.ejs', {
      title: 'Assign Role',
      active: 'staff-roles',
		  layout: 'backoffice/layout.ejs',
      staff,
      roles,
      errors: [{ msg: 'Server error or duplicate entry' }],
      formData: req.body
    });
  }
});

module.exports = router;
