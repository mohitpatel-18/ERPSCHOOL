/**
 * Query Optimization Helpers
 * Provides reusable query optimization patterns
 */

/**
 * Execute lean query for better performance
 * Use when you don't need mongoose document features
 */
const leanQuery = (query) => {
  return query.lean();
};

/**
 * Execute query with selected fields only
 * Reduces payload size and improves performance
 */
const selectFields = (query, fields) => {
  return query.select(fields);
};

/**
 * Execute query with population
 * Optimized to only populate required fields
 */
const populateOptimized = (query, populateConfig) => {
  if (Array.isArray(populateConfig)) {
    populateConfig.forEach(config => {
      query = query.populate(config);
    });
  } else {
    query = query.populate(populateConfig);
  }
  return query;
};

/**
 * Build filter query from request parameters
 * Safely handles query parameters and prevents injection
 */
const buildFilterQuery = (params, allowedFields = []) => {
  const filter = {};
  
  allowedFields.forEach(field => {
    if (params[field] !== undefined && params[field] !== null && params[field] !== '') {
      filter[field] = params[field];
    }
  });
  
  // Handle date range filters
  if (params.startDate || params.endDate) {
    filter.createdAt = {};
    if (params.startDate) filter.createdAt.$gte = new Date(params.startDate);
    if (params.endDate) filter.createdAt.$lte = new Date(params.endDate);
  }
  
  return filter;
};

/**
 * Build search query for text search
 */
const buildSearchQuery = (searchTerm, searchFields = []) => {
  if (!searchTerm || searchFields.length === 0) return {};
  
  return {
    $or: searchFields.map(field => ({
      [field]: { $regex: searchTerm, $options: 'i' }
    }))
  };
};

/**
 * Execute paginated query with optimizations
 */
const executePaginatedQuery = async (Model, filter = {}, options = {}) => {
  const {
    page = 1,
    limit = 20,
    sort = { createdAt: -1 },
    populate = [],
    select = '',
    lean = true
  } = options;
  
  const skip = (page - 1) * limit;
  
  let query = Model.find(filter)
    .sort(sort)
    .limit(limit)
    .skip(skip);
  
  if (select) query = query.select(select);
  if (populate.length > 0) query = populateOptimized(query, populate);
  if (lean) query = query.lean();
  
  const [data, total] = await Promise.all([
    query.exec(),
    Model.countDocuments(filter)
  ]);
  
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }
  };
};

/**
 * Execute aggregation query with pagination
 */
const executeAggregationWithPagination = async (Model, pipeline = [], options = {}) => {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;
  
  const countPipeline = [...pipeline, { $count: 'total' }];
  const dataPipeline = [...pipeline, { $skip: skip }, { $limit: limit }];
  
  const [countResult, data] = await Promise.all([
    Model.aggregate(countPipeline),
    Model.aggregate(dataPipeline)
  ]);
  
  const total = countResult[0]?.total || 0;
  
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }
  };
};

/**
 * Bulk write operations helper
 */
const executeBulkWrite = async (Model, operations) => {
  if (!operations || operations.length === 0) {
    return { success: false, message: 'No operations provided' };
  }
  
  try {
    const result = await Model.bulkWrite(operations, { ordered: false });
    return {
      success: true,
      inserted: result.insertedCount || 0,
      updated: result.modifiedCount || 0,
      deleted: result.deletedCount || 0
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      error
    };
  }
};

/**
 * Check if document exists
 */
const documentExists = async (Model, filter) => {
  const count = await Model.countDocuments(filter).limit(1);
  return count > 0;
};

/**
 * Find one or create
 */
const findOneOrCreate = async (Model, filter, data) => {
  let doc = await Model.findOne(filter);
  
  if (!doc) {
    doc = await Model.create({ ...filter, ...data });
  }
  
  return doc;
};

/**
 * Soft delete helper (updates status instead of deleting)
 */
const softDelete = async (Model, id) => {
  return await Model.findByIdAndUpdate(
    id,
    { status: 'inactive', deletedAt: new Date() },
    { new: true }
  );
};

/**
 * Restore soft deleted document
 */
const restoreSoftDeleted = async (Model, id) => {
  return await Model.findByIdAndUpdate(
    id,
    { status: 'active', $unset: { deletedAt: 1 } },
    { new: true }
  );
};

module.exports = {
  leanQuery,
  selectFields,
  populateOptimized,
  buildFilterQuery,
  buildSearchQuery,
  executePaginatedQuery,
  executeAggregationWithPagination,
  executeBulkWrite,
  documentExists,
  findOneOrCreate,
  softDelete,
  restoreSoftDeleted
};
