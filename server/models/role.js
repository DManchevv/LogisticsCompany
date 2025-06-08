// server/models/role.js
const { staff_pool } = require('../dbUtils');

async function getAllWithPermissions() {
  const result = await staff_pool.query(`
    SELECT r.id, r.name, array_agg(p.name) AS permissions
    FROM roles r
    LEFT JOIN roles_permissions rp ON r.id = rp.role_id
    LEFT JOIN permissions p ON rp.permission_id = p.id
    GROUP BY r.id
    ORDER BY r.id
  `);
  return result.rows;
}

async function getByIdWithPermissions(roleId) {
  const role = await staff_pool.query(`SELECT id, name FROM roles WHERE id = $1`, [roleId]);
  const perms = await staff_pool.query(`SELECT permission_id FROM roles_permissions WHERE role_id = $1`, [roleId]);
  return {
    ...role.rows[0],
    permission_ids: perms.rows.map(r => r.permission_id)
  };
}

async function create(name, permissionIds) {
  const result = await staff_pool.query(`INSERT INTO roles (name) VALUES ($1) RETURNING id`, [name]);
  const roleId = result.rows[0].id;
  for (const pid of permissionIds) {
    await staff_pool.query(`INSERT INTO roles_permissions (role_id, permission_id) VALUES ($1, $2)`, [roleId, pid]);
  }
  return roleId;
}

async function updatePermissions(roleId, permissionIds) {
  await staff_pool.query(`DELETE FROM roles_permissions WHERE role_id = $1`, [roleId]);
  for (const pid of permissionIds) {
    await staff_pool.query(`INSERT INTO roles_permissions (role_id, permission_id) VALUES ($1, $2)`, [roleId, pid]);
  }
}

async function getAllRoles() {
  const result = await staff_pool.query(`SELECT id, name FROM roles ORDER BY name`);
  return result.rows;
}

module.exports = {
  getAllRoles,
	getAllWithPermissions,
	getByIdWithPermissions,
	create,
	updatePermissions
};
