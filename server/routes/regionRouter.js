const express = require('express')
const regionController = require('../controllers/regionController');

const router = express.Router();

router.get('/', regionController.getRegion);
router.post('/', regionController.addRegion);

module.exports = router;