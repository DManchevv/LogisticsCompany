const { staff_pool } = require('../dbUtils');

/**
 * Fetch all active staff-role assignments.
 * Joins staff and roles tables for readable output.
 */
async function getAll() {
  const result = await staff_pool.query(`
    SELECT sr.staff_id,
           sr.role_id,
           s.first_name,
           s.last_name,
           r.name AS role_name
      FROM staff_roles sr
      JOIN staff s ON sr.staff_id = s.id
      JOIN roles r ON sr.role_id = r.id
     WHERE s.active = TRUE
     ORDER BY s.last_name, s.first_name
  `);
  return result.rows;
}

/**
 * Assign a role to a staff member. Ignores duplicates via ON CONFLICT.
 * @param {Number} staffId - ID of the staff member
 * @param {Number} roleId - ID of the role
 */
async function assignRole(staffId, roleId) {
  await staff_pool.query(
    `INSERT INTO staff_roles (staff_id, role_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [staffId, roleId]
  );
}

/**
 * Delete a role assignment from a staff member.
 * @param {Number} staffId - ID of the staff member
 * @param {String} roleName - Name of the role (to look up role_id)
 */
async function deleteAssignment(staffId, roleName) {
  await staff_pool.query(
    `DELETE FROM staff_roles
     WHERE staff_id = $1
       AND role_id = (SELECT id FROM roles WHERE name = $2 LIMIT 1)`,
    [staffId, roleName]
  );
}

module.exports = {
  getAll,
  assignRole,
  deleteAssignment
};

