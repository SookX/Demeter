const express = require('express');
const router = express.Router();

const eventController = require('../controllers/eventController');
const { route } = require('./authRouter');

router.get('/', eventController.getEvents);
router.post('/', eventController.addEvent);
router.post('/generate-news', eventController.generateNewsWithLLM);
router.post('/generate-reminders', eventController.generateReminders);
router.post('/generate-tips', eventController.generateTips);
router.put('/:eventId/mark-read', eventController.markEventAsRead);

module.exports = router;