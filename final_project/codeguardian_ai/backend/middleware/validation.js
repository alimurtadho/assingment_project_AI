const Joi = require('joi');

// File upload validation
const validateFileUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const { originalname, size } = req.file;
  
  // Validate file size (5MB limit)
  if (size > 5 * 1024 * 1024) {
    return res.status(400).json({ error: 'File size exceeds 5MB limit' });
  }
  
  // Validate file extension
  const allowedExtensions = ['.js', '.ts', '.py', '.java', '.cpp', '.c', '.php', '.rb', '.go', '.rs'];
  const fileExtension = originalname.toLowerCase().substring(originalname.lastIndexOf('.'));
  
  if (!allowedExtensions.includes(fileExtension)) {
    return res.status(400).json({ 
      error: 'Invalid file type. Allowed types: ' + allowedExtensions.join(', ')
    });
  }
  
  next();
};

// User registration validation
const validateRegistration = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().min(2).max(50).required(),
    password: Joi.string().min(6).max(100).required()
  });
  
  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ 
      error: 'Validation error',
      details: error.details.map(d => d.message)
    });
  }
  
  next();
};

// User login validation
const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });
  
  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ 
      error: 'Validation error',
      details: error.details.map(d => d.message)
    });
  }
  
  next();
};

// Scan request validation
const validateScanRequest = (req, res, next) => {
  const schema = Joi.object({
    scanType: Joi.string().valid('security', 'ai-review', 'test-generation').optional(),
    options: Joi.object().optional()
  });
  
  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ 
      error: 'Validation error',
      details: error.details.map(d => d.message)
    });
  }
  
  next();
};

// Generic request validation
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ 
        error: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }
    
    next();
  };
};

module.exports = {
  validateFileUpload,
  validateRegistration,
  validateLogin,
  validateScanRequest,
  validateRequest
};
