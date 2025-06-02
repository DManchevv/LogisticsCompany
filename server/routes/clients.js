const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const authMiddleware = require('../middlewares/auth');

router.use(authMiddleware.ensureAuthenticated);

router.get('/', clientController.getAllClients);
router.get('/:id', clientController.getClientById);
router.post('/', authMiddleware.ensureAdmin, clientController.createClient);
router.put('/:id', authMiddleware.ensureAdmin, clientController.updateClient);
router.delete('/:id', authMiddleware.ensureAdmin, clientController.deleteClient);

module.exports = router;
