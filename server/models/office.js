const { staff_pool } = require('../dbUtils');

async function getAllOffices() {
  const result = await staff_pool.query(
    'SELECT * FROM offices WHERE active = TRUE ORDER BY id'
  );
  return result.rows;
}

async function getOfficeById(id) {
  const result = await staff_pool.query(
    'SELECT * FROM offices WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

async function createOffice(data) {
  const { name, address } = data;
  await staff_pool.query(
    'INSERT INTO offices (name, address, active) VALUES ($1, $2, TRUE)',
    [name, address]
  );
}

async function updateOffice(id, data) {
  const { name, address } = data;
  await staff_pool.query(
    'UPDATE offices SET name = $1, address = $2 WHERE id = $3',
    [name, address, id]
  );
}

async function deactivateOffice(id) {
  await staff_pool.query(
    'UPDATE offices SET active = FALSE WHERE id = $1',
    [id]
  );
}

module.exports = {
  getAllOffices,
  getOfficeById,
  createOffice,
  updateOffice,
  deactivateOffice
};
