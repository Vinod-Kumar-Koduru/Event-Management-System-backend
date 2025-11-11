const express = require('express');
const router = express.Router();
const { param } = require('express-validator');
const logsController = require('../controllers/logsController');
const validateRequest = require('../middleware/validateRequest');

// Validation middleware for event ID
const validateEventId = [
  param('eventId').isMongoId().withMessage('Invalid event ID format'),
  validateRequest
];

// Routes
router.get('/event/:eventId', validateEventId, (req, res, next) => logsController.getLogsForEvent(req, res, next));

module.exports = router;