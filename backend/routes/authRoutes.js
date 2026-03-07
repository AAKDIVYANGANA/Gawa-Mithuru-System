const express = require('express');
const router = express.Router();
const { registerFarmer, login } = require('../controllers/authController');

router.post('/register', registerFarmer);
router.post('/login', login);

module.exports = router;