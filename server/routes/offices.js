const express = require('express');
const router = express.Router();
const officeController = require('../controllers/officeController');
const authMiddleware = require('../middlewares/auth');

router.use(authMiddleware.ensureAuthenticated);
router.use(authMiddleware.ensureAdminOrEmployee);

router.get('/', officeController.getAllOffices);
router.get('/:id', officeController.getOfficeById);
router.post('/', authMiddleware.ensureAdmin, officeController.createOffice);
router.put('/:id', authMiddleware.ensureAdmin, officeController.updateOffice);
router.delete('/:id', authMiddleware.ensureAdmin, officeController.deleteOffice);

module.exports = router;
