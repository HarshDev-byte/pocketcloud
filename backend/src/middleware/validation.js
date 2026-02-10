/**
 * Request Validation Middleware
 */

/**
 * Validate file ID parameter
 */
function validateFileId(req, res, next) {
  const fileId = parseInt(req.params.fileId);
  
  if (isNaN(fileId) || fileId <= 0) {
    return res.status(400).json({ 
      error: 'Invalid file ID',
      details: 'File ID must be a positive integer'
    });
  }
  
  req.fileId = fileId;
  next();
}

/**
 * Validate pagination parameters
 */
function validatePagination(req, res, next) {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  
  if (limit < 1 || limit > 1000) {
    return res.status(400).json({ 
      error: 'Invalid limit',
      details: 'Limit must be between 1 and 1000'
    });
  }
  
  if (offset < 0) {
    return res.status(400).json({ 
      error: 'Invalid offset',
      details: 'Offset must be non-negative'
    });
  }
  
  req.pagination = { limit, offset };
  next();
}

/**
 * Validate thumbnail size
 */
function validateThumbnailSize(req, res, next) {
  const size = req.query.size || 'medium';
  const validSizes = ['small', 'medium', 'large'];
  
  if (!validSizes.includes(size)) {
    return res.status(400).json({ 
      error: 'Invalid thumbnail size',
      details: `Size must be one of: ${validSizes.join(', ')}`
    });
  }
  
  req.thumbnailSize = size;
  next();
}

/**
 * Validate file IDs array
 */
function validateFileIds(req, res, next) {
  const { fileIds } = req.body;
  
  if (!fileIds || !Array.isArray(fileIds)) {
    return res.status(400).json({ 
      error: 'Invalid fileIds',
      details: 'fileIds must be an array'
    });
  }
  
  if (fileIds.length === 0) {
    return res.status(400).json({ 
      error: 'Empty fileIds array',
      details: 'At least one file ID required'
    });
  }
  
  if (fileIds.length > 100) {
    return res.status(400).json({ 
      error: 'Too many files',
      details: 'Maximum 100 files per batch'
    });
  }
  
  const validIds = fileIds.every(id => Number.isInteger(id) && id > 0);
  if (!validIds) {
    return res.status(400).json({ 
      error: 'Invalid file IDs',
      details: 'All file IDs must be positive integers'
    });
  }
  
  req.fileIds = fileIds;
  next();
}

/**
 * Validate keep strategy for duplicates
 */
function validateKeepStrategy(req, res, next) {
  const keep = req.query.keep || 'oldest';
  const validStrategies = ['oldest', 'newest'];
  
  if (!validStrategies.includes(keep)) {
    return res.status(400).json({ 
      error: 'Invalid keep strategy',
      details: `Strategy must be one of: ${validStrategies.join(', ')}`
    });
  }
  
  req.keepStrategy = keep;
  next();
}

/**
 * Validate search query
 */
function validateSearchQuery(req, res, next) {
  const { q } = req.query;
  
  if (q && q.length > 500) {
    return res.status(400).json({ 
      error: 'Query too long',
      details: 'Search query must be less than 500 characters'
    });
  }
  
  next();
}

/**
 * Validate backup provider
 */
function validateBackupProvider(req, res, next) {
  const { provider } = req.body || req.params;
  const validProviders = ['s3', 'b2', 'minio', 'wasabi', 'digitalocean'];
  
  if (!provider) {
    return res.status(400).json({ 
      error: 'Provider required',
      details: 'Backup provider must be specified'
    });
  }
  
  if (!validProviders.includes(provider)) {
    return res.status(400).json({ 
      error: 'Invalid provider',
      details: `Provider must be one of: ${validProviders.join(', ')}`
    });
  }
  
  req.backupProvider = provider;
  next();
}

/**
 * Sanitize user input
 */
function sanitizeInput(req, res, next) {
  // Remove any null bytes
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].replace(/\0/g, '');
      }
    });
  }
  
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].replace(/\0/g, '');
      }
    });
  }
  
  next();
}

module.exports = {
  validateFileId,
  validatePagination,
  validateThumbnailSize,
  validateFileIds,
  validateKeepStrategy,
  validateSearchQuery,
  validateBackupProvider,
  sanitizeInput
};
