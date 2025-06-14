const express = require('express');
const router = express.Router();
const controller = require('../controllers/peopleController');

router.get('/:id', controller.getPerson);

module.exports = router;