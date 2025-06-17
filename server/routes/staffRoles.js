const express = require('express');
const router = express.Router();
const staffRolesModel = require('../models/staffRolesModel');
const rolesModel = require('../models/role');
const staffModel = require('../models/staff');

// ============================================================================
// GET /bo/staff-roles - List all staff-role assignments
// ============================================================================
router.get('/', async (req, res) => {
  try {
    const assignments = await staffRolesModel.getAll();

    res.render('backoffice/staff-roles/index.ejs', {
      title: 'Staff Roles',
      active: 'staff-roles',
      layout: 'backoffice/layout.ejs',
      assignments,
      success: req.flash('success'),
      errors: req.flash('error')
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load staff-role assignments');
    res.redirect('/bo/staff-roles');
  }
});

// ============================================================================
// GET /bo/staff-roles/add - Show form to assign a new role to a staff member
// ============================================================================
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
      errors: req.flash('error'),
      success: req.flash('success'),
      formData: req.flash('formData')[0] || {}
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load role assignment form');
    res.redirect('/bo/staff-roles');
  }
});

// ============================================================================
// POST /bo/staff-roles/add - Handle form submission to assign role
// ============================================================================
router.post('/add', async (req, res) => {
  const { staff_id, role_id } = req.body;

  // Validate required fields
  if (!staff_id || !role_id) {
    req.flash('error', 'Both staff and role fields are required');
    req.flash('formData', req.body);
    return res.redirect('/bo/staff-roles/add');
  }

  try {
    await staffRolesModel.assignRole(staff_id, role_id);
    req.flash('success', 'Role assigned successfully');
    res.redirect('/bo/staff-roles');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to assign role (possibly duplicate entry)');
    req.flash('formData', req.body);
    res.redirect('/bo/staff-roles/add');
  }
});

// ============================================================================
// POST /bo/staff-roles/delete - Remove a role from a staff member
// ============================================================================
router.post('/delete', async (req, res) => {
  const { staff_id, role_name } = req.body;

  if (!staff_id || !role_name) {
    req.flash('error', 'Missing staff or role information');
    return res.redirect('/bo/staff-roles');
  }

  try {
    await staffRolesModel.deleteAssignment(staff_id, role_name);
    req.flash('success', 'Role removed successfully');
    res.redirect('/bo/staff-roles');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to remove role');
    res.redirect('/bo/staff-roles');
  }
});

module.exports = router;
