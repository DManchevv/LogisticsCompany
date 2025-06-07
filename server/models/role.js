// server/models/role.js
const { staff_pool } = require('../dbUtils');

async function getAllRoles() {
  const result = await staff_pool.query(`SELECT id, name FROM roles ORDER BY name`);
  return result.rows;
}

module.exports = {
  getAllRoles,
};
