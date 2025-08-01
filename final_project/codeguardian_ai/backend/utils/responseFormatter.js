// Backend Utilities - Response Formatters
class ResponseFormatter {
  static success(data = null, message = 'Success') {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }

  static error(message, code = 500, details = null) {
    return {
      success: false,
      message,
      error: {
        code,
        details
      },
      timestamp: new Date().toISOString()
    };
  }

  static paginated(data, pagination) {
    return {
      success: true,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.limit)
      },
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = ResponseFormatter;

module.exports = ResponseFormatter;
