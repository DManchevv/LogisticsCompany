const express = require('express');
const router = express.Router();
const roleModel = require('../models/role');
const permissionModel = require('../models/permission');

// GET /bo/roles - Display list of all roles with flash messages
router.get('/', async (req, res) => {
  try {
    const roles = await roleModel.getAllWithPermissions();
    res.render('backoffice/roles/index.ejs', {
      layout: 'backoffice/layout.ejs',
      title: 'Roles',
      active: 'roles',
      roles,
      success: req.flash('success'),
      errors: req.flash('error')
    });
  } catch (err) {
    console.error('Error fetching roles:', err);
    req.flash('error', 'Error loading roles.');
    res.redirect('/bo/roles'); // redirect to trigger flash
  }
});

// GET /bo/roles/add
router.get('/add', async (req, res) => {
  try {
    const permissions = await permissionModel.getAll();
    res.render('backoffice/roles/add.ejs', {
      layout: 'backoffice/layout.ejs',
      title: 'Add Role',
      active: 'roles',
      permissions,
      formData: {},
      success: req.flash('success'),
      errors: req.flash('error')
    });
  } catch (err) {
    console.error('Error loading add role form:', err);
    req.flash('error', 'Server error while loading the add role form.');
    res.redirect('/bo/roles');
  }
});

// POST /bo/roles/add
router.post('/add', async (req, res) => {
  const { name, permissions } = req.body;
  const permissionsArray = Array.isArray(permissions) ? permissions : [permissions];

  try {
    await roleModel.create(name, permissionsArray);
    req.flash('success', 'Role created successfully.');
    res.redirect('/bo/roles');
  } catch (err) {
    console.error('Error creating role:', err);
    if (err.code === '23505' && err.constraint === 'roles_name_key') {
      req.flash('error', 'A role with this name already exists.');
    } else {
      req.flash('error', 'Failed to create role.');
    }
    res.redirect('/bo/roles/add');
  }
});

// GET /bo/roles/edit/:id
router.get('/edit/:id', async (req, res) => {
  try {
    const role = await roleModel.getByIdWithPermissions(req.params.id);
    if (!role) {
      req.flash('error', 'Role not found.');
      return res.redirect('/bo/roles');
    }

    const permissions = await permissionModel.getAll();
    res.render('backoffice/roles/edit.ejs', {
      layout: 'backoffice/layout.ejs',
      title: 'Edit Role',
      active: 'roles',
      role,
      permissions,
      success: req.flash('success'),
      errors: req.flash('error')
    });
  } catch (err) {
    console.error('Error loading edit role form:', err);
    req.flash('error', 'Server error while loading the edit form.');
    res.redirect('/bo/roles');
  }
});

// POST /bo/roles/edit/:id
router.post('/edit/:id', async (req, res) => {
  const permissionsArray = Array.isArray(req.body.permissions) ? req.body.permissions : [req.body.permissions];

  try {
    await roleModel.updatePermissions(req.params.id, permissionsArray);
    req.flash('success', 'Role permissions updated.');
    res.redirect('/bo/roles');
  } catch (err) {
    console.error('Error updating role permissions:', err);
    req.flash('error', 'Failed to update role permissions.');
    res.redirect(`/bo/roles/edit/${req.params.id}`);
  }
});

// POST /bo/roles/delete/:id
router.post('/delete/:id', async (req, res) => {
  try {
    await roleModel.deleteRole(req.params.id);
    req.flash('success', 'Role deleted successfully.');
  } catch (err) {
    console.error('Error deleting role:', err);
    req.flash('error', 'Failed to delete role.');
  }
  res.redirect('/bo/roles');
});

module.exports = router;

