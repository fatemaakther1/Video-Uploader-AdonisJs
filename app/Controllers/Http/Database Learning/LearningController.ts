import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import LearningQueries from './LearningQueries'

/**
 * Learning Controller for AdonisJS Relationships
 * This demonstrates @hasOne, @hasMany, @belongsTo, @manyToMany
 */
export default class LearningController {
  private queries: LearningQueries
  
  constructor() {
    this.queries = new LearningQueries()
  }
  
  // ==============================================
  // CREATE SAMPLE DATA FOR LEARNING
  // ==============================================
  
  public async createSampleData({ response }: HttpContextContract) {
    const data = await this.queries.createSampleData()
    
    return response.json({
      message: 'Sample data created successfully!',
      data
    })
  }

  // ==============================================
  // @hasOne RELATIONSHIP EXAMPLES
  // ==============================================

  /**
   * Demonstrates @hasOne relationship
   * User hasOne Profile
   */
  public async hasOneExamples({ response }: HttpContextContract) {
    const examples = await this.queries.getHasOneExamples()
    
    return response.json({
      message: '@hasOne relationship examples',
      examples
    })
  }

  // ==============================================
  // @hasMany RELATIONSHIP EXAMPLES
  // ==============================================

  /**
   * Demonstrates @hasMany relationship
   * User hasMany Posts
   */
  public async hasManyExamples({ response }: HttpContextContract) {
    const examples = await this.queries.getHasManyExamples()
    
    return response.json({
      message: '@hasMany relationship examples',
      examples
    })
  }

  // ==============================================
  // @belongsTo RELATIONSHIP EXAMPLES
  // ==============================================

  /**
   * Demonstrates @belongsTo relationship
   * Post belongsTo User, Profile belongsTo User
   */
  public async belongsToExamples({ response }: HttpContextContract) {
    const examples = await this.queries.getBelongsToExamples()
    
    return response.json({
      message: '@belongsTo relationship examples',
      examples
    })
  }

  // ==============================================
  // @manyToMany RELATIONSHIP EXAMPLES
  // ==============================================

  /**
   * Demonstrates @manyToMany relationship
   * Post manyToMany Tags
   */
  public async manyToManyExamples({ response }: HttpContextContract) {
    const examples = await this.queries.getManyToManyExamples()
    
    return response.json({
      message: '@manyToMany relationship examples',
      examples
    })
  }

  // ==============================================
  // ADVANCED QUERY EXAMPLES
  // ==============================================

  /**
   * Advanced relationship queries
   */
  public async advancedQueries({ response }: HttpContextContract) {
    const examples = await this.queries.getAdvancedQueryExamples()
    
    return response.json({
      message: 'Advanced relationship queries',
      examples
    })
  }

  // ==============================================
  // CLEANUP METHOD
  // ==============================================

  public async cleanupData({ response }: HttpContextContract) {
    await this.queries.cleanupAllData()
    
    return response.json({
      message: 'All learning data cleaned up successfully!'
    })
  }
}
