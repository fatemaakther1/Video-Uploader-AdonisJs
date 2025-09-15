import Logger from '@ioc:Adonis/Core/Logger'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ExceptionHandler extends HttpExceptionHandler {
  constructor() {
    super(Logger)
  }

  /**
   * Central error handler for Video-Uploader project
   * Handles all errors and returns user-friendly responses
   */
  public async handle(error: any, ctx: HttpContextContract) {
    const { response, request } = ctx
    const isDevelopment = process.env.NODE_ENV === 'development'

    /**
     * 🔐 Authentication & Authorization Errors
     */

    if (error.code === 'E_INVALID_API_TOKEN' || error.status === 401) {
      return response.status(401).json({
        success: false,
        message: 'Invalid or expired API token',
        error_code: 'INVALID_TOKEN',
        statusCode: 401
      })
    }

    /**
     * ✅ Validation Errors (from your validators)
     */
    if (error.code === 'E_VALIDATION_FAILURE' || error.messages) {
      return response.status(422).json({
        success: false,
        message: 'Request validation failed',
        errors: error.messages || error.errors,
        error_code: 'VALIDATION_ERROR',
        statusCode: 422
      })
    }

    /**
     * 🌐 Network & External API Errors (Bunny.net)
     */
    if (error.isAxiosError || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      const status = error.response?.status || 502
      
      // Bunny.net API specific errors
      if (error.response?.status === 400) {
        return response.status(400).json({
          success: false,
          message: 'Invalid request to video service',
          error_code: 'EXTERNAL_API_BAD_REQUEST',
          statusCode: 400,
          details: isDevelopment ? error.response?.data : undefined
        })
      }
      
      if (error.response?.status === 401) {
        return response.status(401).json({
          success: false,
          message: 'Video service authentication failed - check API key',
          error_code: 'EXTERNAL_API_UNAUTHORIZED',
          statusCode: 401
        })
      }
      
      if (error.response?.status === 403) {
        return response.status(403).json({
          success: false,
          message: 'Access denied to video service',
          error_code: 'EXTERNAL_API_FORBIDDEN',
          statusCode: 403
        })
      }
      
      if (error.response?.status === 404) {
        return response.status(404).json({
          success: false,
          message: 'Video not found in external service',
          error_code: 'EXTERNAL_VIDEO_NOT_FOUND',
          statusCode: 404
        })
      }
      
      if (error.response?.status >= 500) {
        return response.status(502).json({
          success: false,
          message: 'Video service is currently unavailable',
          error_code: 'EXTERNAL_API_ERROR',
          statusCode: 502
        })
      }
      
      // Generic network errors
      return response.status(status >= 400 ? status : 502).json({
        success: false,
        message: error.code === 'ETIMEDOUT' 
          ? 'Request to video service timed out' 
          : 'Failed to connect to video service',
        error_code: error.code === 'ETIMEDOUT' ? 'REQUEST_TIMEOUT' : 'NETWORK_ERROR',
        statusCode: status >= 400 ? status : 502
      })
    }

    /**
     * 🗃️ Database Errors
     */
    // MySQL specific errors
    if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
      // Extract field name from error message if possible
      let message = 'This record already exists in the database'
      let errorCode = 'DUPLICATE_ENTRY'
      
      if (error.sqlMessage) {
        if (error.sqlMessage.includes('email')) {
          message = 'This email address is already registered'
          errorCode = 'EMAIL_ALREADY_EXISTS'
        } else if (error.sqlMessage.includes('username')) {
          message = 'This username is already taken'
          errorCode = 'USERNAME_ALREADY_EXISTS'
        } else if (error.sqlMessage.includes('slug')) {
          message = 'This slug already exists'
          errorCode = 'SLUG_ALREADY_EXISTS'
        } else if (error.sqlMessage.includes('video')) {
          message = 'This video already exists in the database'
          errorCode = 'VIDEO_ALREADY_EXISTS'
        }
      }
      
      return response.status(409).json({
        success: false,
        message: message,
        error_code: errorCode,
        statusCode: 409,
        details: isDevelopment ? error.sqlMessage : undefined
      })
    }

    if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.errno === 1452) {
      return response.status(400).json({
        success: false,
        message: 'Referenced record does not exist',
        error_code: 'FOREIGN_KEY_ERROR',
        statusCode: 400
      })
    }

    if (error.code === 'ER_BAD_FIELD_ERROR' || error.errno === 1054) {
      return response.status(500).json({
        success: false,
        message: 'Database schema error - please contact administrator',
        error_code: 'DATABASE_SCHEMA_ERROR',
        statusCode: 500,
        details: isDevelopment ? error.sqlMessage : undefined
      })
    }

    if (error.code === 'ECONNREFUSED' && error.port === 3306) {
      return response.status(503).json({
        success: false,
        message: 'Database connection failed',
        error_code: 'DATABASE_CONNECTION_ERROR',
        statusCode: 503
      })
    }

    /**
     * 🔍 Route & Method Errors
     */
    if (error.code === 'E_ROUTE_NOT_FOUND') {
      return response.status(404).json({
        success: false,
        message: 'The requested endpoint was not found',
        error_code: 'ENDPOINT_NOT_FOUND',
        statusCode: 404,
        path: request.url()
      })
    }

    if (error.code === 'E_HTTP_REQUEST_METHOD_NOT_ALLOWED') {
      return response.status(405).json({
        success: false,
        message: `HTTP method ${request.method()} not allowed for this endpoint`,
        error_code: 'METHOD_NOT_ALLOWED',
        statusCode: 405,
        allowed_methods: error.allowedMethods
      })
    }

    /**
     * 📚 Learning Controller Specific Errors
     */
    if (error.code === 'E_LEARNING_SAMPLE_DATA_FAILED') {
      return response.status(500).json({
        success: false,
        message: 'Failed to create sample data',
        error_code: 'SAMPLE_DATA_CREATION_FAILED',
        statusCode: 500,
        details: isDevelopment ? error.message : undefined
      })
    }

    if (error.code === 'E_LEARNING_HASONE_FAILED') {
      return response.status(500).json({
        success: false,
        message: 'hasOne examples failed',
        error_code: 'HASONE_EXAMPLES_FAILED',
        statusCode: 500,
        details: isDevelopment ? error.message : undefined
      })
    }

    if (error.code === 'E_LEARNING_HASMANY_FAILED') {
      return response.status(500).json({
        success: false,
        message: 'hasMany examples failed',
        error_code: 'HASMANY_EXAMPLES_FAILED',
        statusCode: 500,
        details: isDevelopment ? error.message : undefined
      })
    }

    if (error.code === 'E_LEARNING_BELONGSTO_FAILED') {
      return response.status(500).json({
        success: false,
        message: 'belongsTo examples failed',
        error_code: 'BELONGSTO_EXAMPLES_FAILED',
        statusCode: 500,
        details: isDevelopment ? error.message : undefined
      })
    }

    if (error.code === 'E_LEARNING_MANYTOMANY_FAILED') {
      return response.status(500).json({
        success: false,
        message: 'manyToMany examples failed',
        error_code: 'MANYTOMANY_EXAMPLES_FAILED',
        statusCode: 500,
        details: isDevelopment ? error.message : undefined
      })
    }

    if (error.code === 'E_LEARNING_ADVANCED_QUERIES_FAILED') {
      return response.status(500).json({
        success: false,
        message: 'Advanced queries failed',
        error_code: 'ADVANCED_QUERIES_FAILED',
        statusCode: 500,
        details: isDevelopment ? error.message : undefined
      })
    }

    if (error.code === 'E_LEARNING_CLEANUP_FAILED') {
      return response.status(500).json({
        success: false,
        message: 'Failed to cleanup data',
        error_code: 'DATA_CLEANUP_FAILED',
        statusCode: 500,
        details: isDevelopment ? error.message : undefined
      })
    }

    /**
     * 📋 CRUD Operation Specific Errors
     */
    // User errors
    if (error.code === 'E_ROW_NOT_FOUND' && error.message?.includes('User')) {
      return response.status(404).json({
        success: false,
        message: 'User not found',
        error_code: 'USER_NOT_FOUND',
        statusCode: 404
      })
    }

    if (error.code === 'E_CRUD_USER_CREATE_FAILED') {
      return response.status(400).json({
        success: false,
        message: 'Failed to create user',
        error_code: 'USER_CREATE_FAILED',
        statusCode: 400,
        details: isDevelopment ? error.message : undefined
      })
    }

    if (error.code === 'E_CRUD_USER_UPDATE_FAILED') {
      return response.status(400).json({
        success: false,
        message: 'Failed to update user',
        error_code: 'USER_UPDATE_FAILED',
        statusCode: 400,
        details: isDevelopment ? error.message : undefined
      })
    }

    if (error.code === 'E_CRUD_USER_DELETE_FAILED') {
      return response.status(400).json({
        success: false,
        message: 'Failed to delete user',
        error_code: 'USER_DELETE_FAILED',
        statusCode: 400,
        details: isDevelopment ? error.message : undefined
      })
    }

    // Profile errors
    if (error.code === 'E_ROW_NOT_FOUND' && error.message?.includes('Profile')) {
      return response.status(404).json({
        success: false,
        message: 'Profile not found',
        error_code: 'PROFILE_NOT_FOUND',
        statusCode: 404
      })
    }

    if (error.code === 'E_CRUD_PROFILE_ALREADY_EXISTS') {
      return response.status(409).json({
        success: false,
        message: 'User already has a profile',
        error_code: 'PROFILE_ALREADY_EXISTS',
        statusCode: 409
      })
    }

    if (error.code === 'E_CRUD_PROFILE_CREATE_FAILED') {
      return response.status(400).json({
        success: false,
        message: 'Failed to create profile',
        error_code: 'PROFILE_CREATE_FAILED',
        statusCode: 400,
        details: isDevelopment ? error.message : undefined
      })
    }

    // Post errors
    if (error.code === 'E_ROW_NOT_FOUND' && error.message?.includes('Post')) {
      return response.status(404).json({
        success: false,
        message: 'Post not found',
        error_code: 'POST_NOT_FOUND',
        statusCode: 404
      })
    }

    if (error.code === 'E_CRUD_POST_CREATE_FAILED') {
      return response.status(400).json({
        success: false,
        message: 'Failed to create post',
        error_code: 'POST_CREATE_FAILED',
        statusCode: 400,
        details: isDevelopment ? error.message : undefined
      })
    }

    // Tag errors
    if (error.code === 'E_ROW_NOT_FOUND' && error.message?.includes('Tag')) {
      return response.status(404).json({
        success: false,
        message: 'Tag not found',
        error_code: 'TAG_NOT_FOUND',
        statusCode: 404
      })
    }

    if (error.code === 'E_CRUD_TAG_CREATE_FAILED') {
      return response.status(400).json({
        success: false,
        message: 'Failed to create tag',
        error_code: 'TAG_CREATE_FAILED',
        statusCode: 400,
        details: isDevelopment ? error.message : undefined
      })
    }

    if (error.code === 'E_CRUD_TAG_ATTACH_FAILED') {
      return response.status(400).json({
        success: false,
        message: 'Failed to attach tags to post',
        error_code: 'TAG_ATTACH_FAILED',
        statusCode: 400,
        details: isDevelopment ? error.message : undefined
      })
    }

    // General CRUD errors
    if (error.code === 'E_CRUD_SEARCH_FAILED') {
      return response.status(500).json({
        success: false,
        message: 'Search operation failed',
        error_code: 'SEARCH_FAILED',
        statusCode: 500,
        details: isDevelopment ? error.message : undefined
      })
    }

    if (error.code === 'E_CRUD_STATS_FAILED') {
      return response.status(500).json({
        success: false,
        message: 'Failed to retrieve statistics',
        error_code: 'STATS_FAILED',
        statusCode: 500,
        details: isDevelopment ? error.message : undefined
      })
    }

    // Generic model not found errors
    if (error.code === 'E_ROW_NOT_FOUND') {
      return response.status(404).json({
        success: false,
        message: 'Record not found',
        error_code: 'RECORD_NOT_FOUND',
        statusCode: 404
      })
    }

    /**
     * 📹 Video-specific Application Errors
     */
    if (error.code === 'E_VIDEO_NOT_FOUND') {
      return response.status(404).json({
        success: false,
        message: 'Video not found',
        error_code: 'VIDEO_NOT_FOUND',
        statusCode: 404
      })
    }

    if (error.code === 'E_VIDEO_PROCESSING_FAILED') {
      return response.status(422).json({
        success: false,
        message: 'Video processing failed',
        error_code: 'VIDEO_PROCESSING_FAILED',
        statusCode: 422
      })
    }

    if (error.code === 'E_INVALID_VIDEO_URL') {
      return response.status(400).json({
        success: false,
        message: 'Invalid video URL provided',
        error_code: 'INVALID_VIDEO_URL',
        statusCode: 400
      })
    }

    if (error.code === 'E_VIDEO_UPLOAD_FAILED') {
      return response.status(400).json({
        success: false,
        message: 'Video upload failed',
        error_code: 'VIDEO_UPLOAD_FAILED',
        statusCode: 400
      })
    }

    if (error.code === 'E_WEBHOOK_VALIDATION_FAILED') {
      return response.status(400).json({
        success: false,
        message: 'Invalid webhook data received',
        error_code: 'WEBHOOK_VALIDATION_FAILED',
        statusCode: 400
      })
    }

    /**
     * 💾 File & Storage Errors
     */
    if (error.code === 'ENOENT') {
      return response.status(404).json({
        success: false,
        message: 'File not found',
        error_code: 'FILE_NOT_FOUND',
        statusCode: 404
      })
    }

    if (error.code === 'EACCES') {
      return response.status(403).json({
        success: false,
        message: 'File access denied',
        error_code: 'FILE_ACCESS_DENIED',
        statusCode: 403
      })
    }

    /**
     * 🚦 Rate Limiting & Quota Errors
     */
    if (error.status === 429 || error.code === 'E_TOO_MANY_REQUESTS') {
      return response.status(429).json({
        success: false,
        message: 'Too many requests - please slow down',
        error_code: 'RATE_LIMIT_EXCEEDED',
        statusCode: 429,
        retry_after: error.retryAfter || '60 seconds'
      })
    }

    /**
     * 📝 Content & Format Errors
     */
    if (error.code === 'E_INVALID_JSON' || error.type === 'entity.parse.failed') {
      return response.status(400).json({
        success: false,
        message: 'Invalid JSON in request body',
        error_code: 'INVALID_JSON',
        statusCode: 400
      })
    }

    if (error.code === 'LIMIT_FILE_SIZE') {
      return response.status(413).json({
        success: false,
        message: 'File size exceeds maximum limit',
        error_code: 'FILE_TOO_LARGE',
        statusCode: 413,
        max_size: error.limit
      })
    }

    /**
     * 🔧 Environment & Configuration Errors
     */
    if (error.message?.includes('APP_KEY') || error.message?.includes('LIBRARY_ID')) {
      return response.status(500).json({
        success: false,
        message: 'Server configuration error',
        error_code: 'CONFIGURATION_ERROR',
        statusCode: 500
      })
    }

    /**
     * 📊 Log all errors for monitoring
     */
    const logData = {
      error: error.message,
      stack: error.stack,
      code: error.code,
      status: error.status,
      url: request.url(),
      method: request.method(),
      ip: request.ip(),
      userAgent: request.header('User-Agent'),
      timestamp: new Date().toISOString()
    }

    // Log based on severity
    if (error.status >= 500) {
      Logger.error('Server Error:', logData)
    } else if (error.status >= 400) {
      Logger.warn('Client Error:', logData)
    } else {
      Logger.info('Application Error:', logData)
    }

    /**
     * 💥 Generic/Unknown Errors
     */
    const statusCode = error.status || error.statusCode || 500
    
    return response.status(statusCode).json({
      success: false,
      message: isDevelopment 
        ? error.message 
        : statusCode >= 500 
          ? 'Internal server error occurred' 
          : error.message || 'An error occurred',
      error_code: 'INTERNAL_ERROR',
      statusCode,
      ...(isDevelopment && { 
        stack: error.stack,
        details: error 
      })
    })
  }

  /**
   * Report exceptions (for external monitoring services)
   */
  public async report(error: any, ctx: HttpContextContract) {
    // Don't report client errors or validation errors
    if (!this.shouldntReport(error)) {
      const reportData = {
        message: error.message,
        stack: error.stack,
        code: error.code,
        url: ctx.request.url(),
        method: ctx.request.method(),
        ip: ctx.request.ip(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      }

      // Here you can integrate with external services like:
      // - Sentry: Sentry.captureException(error)
      // - Bugsnag: Bugsnag.notify(error)
      // - Custom logging service
      
      Logger.error('Exception reported for monitoring:', reportData)
    }
  }

  /**
   * Don't report certain errors to external services
   */
  private shouldntReport(error: any): boolean {
    const dontReport = [
      'E_VALIDATION_FAILURE',
      'E_UNAUTHORIZED_ACCESS',
      'E_ROUTE_NOT_FOUND',
      'E_HTTP_REQUEST_METHOD_NOT_ALLOWED'
    ]
    
    // Don't report client errors (4xx) except 429
    const clientErrorsToIgnore = [400, 401, 403, 404, 405, 422]
    
    return dontReport.includes(error.code) || 
           (error.status && clientErrorsToIgnore.includes(error.status))
  }
}
