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
  
  public async createSampleData(ctx: HttpContextContract) {
    const data = await this.queries.createSampleData(ctx)
    
    return ctx.response.json({
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
  public async hasOneExamples(ctx: HttpContextContract) {
    const examples = await this.queries.getHasOneExamples(ctx)
    
    return ctx.response.json({
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
  public async hasManyExamples(ctx: HttpContextContract) {
    const examples = await this.queries.getHasManyExamples(ctx)
    
    return ctx.response.json({
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
  public async belongsToExamples(ctx: HttpContextContract) {
    const examples = await this.queries.getBelongsToExamples(ctx)
    
    return ctx.response.json({
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
  public async manyToManyExamples(ctx: HttpContextContract) {
    const examples = await this.queries.getManyToManyExamples(ctx)
    
    return ctx.response.json({
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
  public async advancedQueries(ctx: HttpContextContract) {
    const examples = await this.queries.getAdvancedQueryExamples(ctx)
    
    return ctx.response.json({
      message: 'Advanced relationship queries',
      examples
    })
  }

  // ==============================================
  // CLEANUP METHOD
  // ==============================================

  public async cleanupData(ctx: HttpContextContract) {
    await this.queries.cleanupAllData(ctx)
    
    return ctx.response.json({
      message: 'All learning data cleaned up successfully!'
    })
  }
}
