/**
 * Pagination Middleware
 * Extracts and validates pagination parameters from query string
 */

const pagination = (req, res, next) => {
  // Extract pagination params from query
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const sort = req.query.sort || '-createdAt';
  const select = req.query.select || '';
  const populate = req.query.populate || '';

  // Validate pagination values
  const validatedPage = Math.max(1, page);
  const validatedLimit = Math.min(Math.max(1, limit), 100); // Max 100 per page

  // Attach to request object
  req.pagination = {
    page: validatedPage,
    limit: validatedLimit,
    skip: (validatedPage - 1) * validatedLimit,
    sort: parseSortString(sort),
    select,
    populate
  };

  next();
};

/**
 * Parse sort string into MongoDB sort object
 * Examples: 
 *   "-createdAt" => { createdAt: -1 }
 *   "name,createdAt" => { name: 1, createdAt: 1 }
 *   "-name,createdAt" => { name: -1, createdAt: 1 }
 */
const parseSortString = (sortString) => {
  if (!sortString) return { createdAt: -1 };

  const sortObject = {};
  const fields = sortString.split(',');

  fields.forEach(field => {
    field = field.trim();
    if (field.startsWith('-')) {
      sortObject[field.substring(1)] = -1;
    } else {
      sortObject[field] = 1;
    }
  });

  return sortObject;
};

/**
 * Format pagination response
 */
const formatPaginationResponse = (data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null
    }
  };
};

module.exports = {
  pagination,
  formatPaginationResponse,
  parseSortString
};
