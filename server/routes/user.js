const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/refresh', controller.refresh);
router.post('/logout', controller.logout);

router.get('/:email/profile', controller.getProfile);
router.put('/:email/profile', controller.updateProfile);

module.exports = router;