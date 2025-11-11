
const { validationResult } = require('express-validator');


function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    
    const errorMessages = errors.array().map(error => ({
      field: error.param || error.location,
      message: error.msg || 'Validation failed',
      value: error.value
    }));
    
    
    const firstError = errorMessages[0];
    const errorMessage = firstError ? firstError.message : 'Validation failed';
    
    return res.status(400).json({
      error: 'Validation failed',
      message: errorMessage,
      details: errorMessages
    });
  }
  next();
}

module.exports = validateRequest;
