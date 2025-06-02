const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipmentController');
const authMiddleware = require('../middlewares/auth');

router.use(authMiddleware.ensureAuthenticated);

router.get('/', shipmentController.getAllShipments);
router.get('/:id', shipmentController.getShipmentById);
router.post('/', authMiddleware.ensureAdminOrEmployee, shipmentController.createShipment);
router.put('/:id/status', authMiddleware.ensureAdminOrEmployee, shipmentController.updateShipmentStatus);

module.exports = router;
