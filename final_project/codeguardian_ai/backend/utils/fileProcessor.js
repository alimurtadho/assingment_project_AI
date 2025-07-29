/**
 * File Processing Utilities
 * Shared utilities for handling file uploads and processing
 */

const multer = require('multer');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common code file types
    const allowedTypes = ['.js', '.ts', '.py', '.java', '.cpp', '.c', '.php', '.rb', '.go', '.rs', '.jsx', '.tsx'];
    const fileExt = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only code files are allowed.'));
    }
  }
});

/**
 * Process uploaded file to extract content
 * @param {Object} file - Multer file object
 * @returns {Object} - { filename, content }
 */
const processUploadedFile = (file) => {
  if (!file) {
    throw new Error('No file provided');
  }

  return {
    filename: file.originalname,
    content: file.buffer.toString('utf-8'),
    size: file.size,
    mimetype: file.mimetype
  };
};

/**
 * Process multiple uploaded files
 * @param {Array} files - Array of multer file objects
 * @returns {Array} - Array of processed file objects
 */
const processUploadedFiles = (files) => {
  if (!files || files.length === 0) {
    throw new Error('No files provided');
  }

  return files.map(file => processUploadedFile(file));
};

/**
 * Detect programming language from filename
 * @param {string} filename - Name of the file
 * @returns {string} - Detected language
 */
const detectLanguage = (filename) => {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  const languageMap = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.py': 'python',
    '.java': 'java',
    '.cpp': 'cpp',
    '.c': 'c',
    '.php': 'php',
    '.rb': 'ruby',
    '.go': 'go',
    '.rs': 'rust'
  };
  
  return languageMap[ext] || 'unknown';
};

module.exports = {
  upload,
  processUploadedFile,
  processUploadedFiles,
  detectLanguage
};
