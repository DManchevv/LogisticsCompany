const { staff_pool } = require('../dbUtils');

async function getAllAssignments() {
  const result = await staff_pool.query(`
    SELECT sr.staff_id, s.first_name, s.last_name, r.name AS role
    FROM staff_roles sr
    JOIN staff s ON sr.staff_id = s.id
    JOIN roles r ON sr.role_id = r.id
    WHERE s.active = TRUE
    ORDER BY s.last_name, r.name
  `);
  return result.rows;
}

async function assignRole(staffId, roleId) {
  await staff_pool.query(
    `INSERT INTO staff_roles (staff_id, role_id) VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [staffId, roleId]
  );
}

module.exports = {
  getAllAssignments,
  assignRole,
};
