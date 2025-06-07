// models/staffModel.js
const { staff_pool } = require('../dbUtils');

async function getAllStaff() {
  const res = await staff_pool.query('SELECT * FROM staff ORDER BY id');
  return res.rows;
}

async function getStaffById(id) {
  const res = await staff_pool.query('SELECT * FROM staff WHERE id = $1', [id]);
  return res.rows[0];
}

async function createStaff({ first_name, last_name, position, office_id }) {
  const res = await staff_pool.query(
    `INSERT INTO staff (first_name, last_name, position, office_id) 
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [first_name, last_name, position, office_id]
  );
  return res.rows[0];
}

async function updateStaff(id, { first_name, last_name, position, office_id }) {
  const res = await staff_pool.query(
    `UPDATE staff SET first_name = $1, last_name = $2, position = $3, office_id = $4
     WHERE id = $5 RETURNING *`,
    [first_name, last_name, position, office_id, id]
  );
  return res.rows[0];
}

async function deleteStaff(id) {
  await staff_pool.query('UPDATE staff SET active = FALSE WHERE id = $1', [id]);
}

module.exports = {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
};
