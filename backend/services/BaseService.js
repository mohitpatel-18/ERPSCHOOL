/**
 * BaseService - Generic service layer for all models
 * Provides common CRUD operations with built-in error handling
 */

class BaseService {
  constructor(model) {
    this.model = model;
  }

  /**
   * Create a new document
   */
  async create(data, options = {}) {
    try {
      const document = await this.model.create(data);
      return document;
    } catch (error) {
      throw this.handleError(error, 'create');
    }
  }

  /**
   * Find document by ID
   */
  async findById(id, options = {}) {
    try {
      const { populate = '', select = '' } = options;
      let query = this.model.findById(id);
      
      if (populate) query = query.populate(populate);
      if (select) query = query.select(select);
      
      return await query.exec();
    } catch (error) {
      throw this.handleError(error, 'findById');
    }
  }

  /**
   * Find one document by filter
   */
  async findOne(filter, options = {}) {
    try {
      const { populate = '', select = '' } = options;
      let query = this.model.findOne(filter);
      
      if (populate) query = query.populate(populate);
      if (select) query = query.select(select);
      
      return await query.exec();
    } catch (error) {
      throw this.handleError(error, 'findOne');
    }
  }

  /**
   * Find multiple documents with pagination support
   */
  async find(filter = {}, options = {}) {
    try {
      const {
        populate = '',
        select = '',
        sort = { createdAt: -1 },
        page = 1,
        limit = 20,
        lean = false
      } = options;

      const skip = (page - 1) * limit;
      
      let query = this.model.find(filter);
      
      if (populate) query = query.populate(populate);
      if (select) query = query.select(select);
      if (sort) query = query.sort(sort);
      if (lean) query = query.lean();
      
      query = query.skip(skip).limit(limit);
      
      const [data, total] = await Promise.all([
        query.exec(),
        this.model.countDocuments(filter)
      ]);

      return {
        data,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw this.handleError(error, 'find');
    }
  }

  /**
   * Update document by ID
   */
  async updateById(id, data, options = {}) {
    try {
      const { returnNew = true } = options;
      const document = await this.model.findByIdAndUpdate(
        id,
        data,
        { new: returnNew, runValidators: true }
      );
      
      if (!document) {
        throw new Error('Document not found');
      }
      
      return document;
    } catch (error) {
      throw this.handleError(error, 'updateById');
    }
  }

  /**
   * Update one document by filter
   */
  async updateOne(filter, data, options = {}) {
    try {
      const { returnNew = true } = options;
      const document = await this.model.findOneAndUpdate(
        filter,
        data,
        { new: returnNew, runValidators: true }
      );
      
      if (!document) {
        throw new Error('Document not found');
      }
      
      return document;
    } catch (error) {
      throw this.handleError(error, 'updateOne');
    }
  }

  /**
   * Delete document by ID
   */
  async deleteById(id) {
    try {
      const document = await this.model.findByIdAndDelete(id);
      
      if (!document) {
        throw new Error('Document not found');
      }
      
      return document;
    } catch (error) {
      throw this.handleError(error, 'deleteById');
    }
  }

  /**
   * Count documents
   */
  async count(filter = {}) {
    try {
      return await this.model.countDocuments(filter);
    } catch (error) {
      throw this.handleError(error, 'count');
    }
  }

  /**
   * Aggregate query
   */
  async aggregate(pipeline) {
    try {
      return await this.model.aggregate(pipeline);
    } catch (error) {
      throw this.handleError(error, 'aggregate');
    }
  }

  /**
   * Bulk operations
   */
  async bulkWrite(operations) {
    try {
      return await this.model.bulkWrite(operations);
    } catch (error) {
      throw this.handleError(error, 'bulkWrite');
    }
  }

  /**
   * Check if document exists
   */
  async exists(filter) {
    try {
      return await this.model.exists(filter);
    } catch (error) {
      throw this.handleError(error, 'exists');
    }
  }

  /**
   * Handle service errors
   */
  handleError(error, operation) {
    const errorMessage = `${this.model.modelName} Service Error (${operation}): ${error.message}`;
    
    // Preserve original error properties
    const serviceError = new Error(errorMessage);
    serviceError.originalError = error;
    serviceError.operation = operation;
    serviceError.modelName = this.model.modelName;
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      serviceError.statusCode = 400;
      serviceError.validationErrors = error.errors;
    } else if (error.name === 'CastError') {
      serviceError.statusCode = 400;
      serviceError.message = 'Invalid ID format';
    } else if (error.code === 11000) {
      serviceError.statusCode = 409;
      serviceError.message = 'Duplicate entry found';
      serviceError.duplicateFields = Object.keys(error.keyPattern || {});
    } else {
      serviceError.statusCode = 500;
    }
    
    return serviceError;
  }
}

module.exports = BaseService;
