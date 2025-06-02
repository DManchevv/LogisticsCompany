const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const authMiddleware = require('../middlewares/auth');

router.use(authMiddleware.ensureAuthenticated);
router.use(authMiddleware.ensureAdminOrEmployee);

router.get('/', employeeController.getAllEmployees);
router.get('/:id', employeeController.getEmployeeById);
router.post('/', authMiddleware.ensureAdmin, employeeController.createEmployee);
router.put('/:id', authMiddleware.ensureAdmin, employeeController.updateEmployee);
router.delete('/:id', authMiddleware.ensureAdmin, employeeController.deleteEmployee);

module.exports = router;
