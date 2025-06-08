const { staff_pool } = require('../dbUtils');

async function getAll() {
  const result = await staff_pool.query(`SELECT id, name FROM permissions ORDER BY name`);
  return result.rows;
}

module.exports = { getAll };
