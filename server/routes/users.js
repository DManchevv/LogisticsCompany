const express = require('express');
const router = express.Router();

// GET /users
router.get('/', (req, res) => {
    res.send('Users page will be here');
});

module.exports = router;
