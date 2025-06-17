const { staff_pool } = require('../dbUtils');

async function getAllUsers() {
  const result = await staff_pool.query('SELECT * FROM users WHERE active = TRUE ORDER BY id');
  return result.rows;
}

async function getUserById(id) {
  const result = await staff_pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
}

async function createUser({ username, password, first_name, last_name, email, phone, address }) {
  await staff_pool.query(
    `INSERT INTO users (username, password, first_name, last_name, email, phone, address)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [username, password, first_name, last_name, email, phone, address]
  );
}

async function updateUser(id, { username, first_name, last_name, email, phone, address }) {
  await staff_pool.query(
    `UPDATE users 
     SET username = $1, first_name = $2, last_name = $3, email = $4, phone = $5, address = $6
     WHERE id = $7`,
    [username, first_name, last_name, email, phone, address, id]
  );
}

async function deleteUser(id) {
  await staff_pool.query('UPDATE users set active = FALSE WHERE id = $1', [id]);
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
