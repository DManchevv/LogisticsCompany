const { staff_pool } = require('../dbUtils');

async function getAllUsers() {
  const result = await staff_pool.query('SELECT * FROM users ORDER BY id');
  return result.rows;
}

async function getUserById(id) {
  const result = await staff_pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
}

async function createUser({ first_name, last_name, email }) {
  await staff_pool.query(
    'INSERT INTO users (first_name, last_name, email) VALUES ($1, $2, $3)',
    [first_name, last_name, email]
  );
}

async function updateUser(id, { first_name, last_name, email }) {
  await staff_pool.query(
    'UPDATE users SET first_name = $1, last_name = $2, email = $3 WHERE id = $4',
    [first_name, last_name, email, id]
  );
}

async function deleteUser(id) {
  await staff_pool.query('DELETE FROM users WHERE id = $1', [id]);
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
