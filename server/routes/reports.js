const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middlewares/auth');

router.use(authMiddleware.ensureAuthenticated);
router.use(authMiddleware.ensureAdminOrEmployee);

router.get('/revenue', reportController.getRevenueReport);
router.get('/pending-shipments', reportController.getPendingShipments);
router.get('/employee-shipments/:employee_id', reportController.getEmployeeShipments);

// Коригиран маршрут
router.get('/client-shipments/:client_id/:type', (req, res, next) => {
  const { type } = req.params;
  
  if (type === 'sent' || type === 'received') {
    return reportController.getClientShipments(req, res, next);
  }
  
  res.status(400).json({ error: 'Invalid shipment type. Must be "sent" or "received".' });
});

module.exports = router;
