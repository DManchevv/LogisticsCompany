const express = require('express');
const router = express.Router();
const roleModel = require('../models/role');
const permissionModel = require('../models/permission');

// GET /bo/roles
router.get('/', async (req, res) => {
  const roles = await roleModel.getAllWithPermissions();
  res.render('backoffice/roles/index.ejs', { layout: 'backoffice/layout.ejs', title: 'Roles', active: 'roles', roles });
});

// GET /bo/roles/add
router.get('/add', async (req, res) => {
  const permissions = await permissionModel.getAll();
  res.render('backoffice/roles/add.ejs', { layout: 'backoffice/layout.ejs', title: 'Add Role', active: 'roles', permissions });
});

// POST /bo/roles/add
router.post('/add', async (req, res) => {
  const { name, permissions } = req.body;
  const roleId = await roleModel.create(name, Array.isArray(permissions) ? permissions : [permissions]);
  res.redirect('/bo/roles');
});

// GET /bo/roles/edit/:id
router.get('/edit/:id', async (req, res) => {
  const role = await roleModel.getByIdWithPermissions(req.params.id);
  const permissions = await permissionModel.getAll();
  res.render('backoffice/roles/edit.ejs', {
    layout: 'backoffice/layout.ejs',
    title: 'Edit Role',
    active: 'roles',
    role,
    permissions
  });
});

// POST /bo/roles/edit/:id
router.post('/edit/:id', async (req, res) => {
  const permissions = Array.isArray(req.body.permissions) ? req.body.permissions : [req.body.permissions];
  await roleModel.updatePermissions(req.params.id, permissions);
  res.redirect('/bo/roles');
});

module.exports = router;
