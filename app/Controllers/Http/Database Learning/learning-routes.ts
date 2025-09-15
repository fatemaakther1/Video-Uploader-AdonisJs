import Route from '@ioc:Adonis/Core/Route'

/**
 * Learning Routes for AdonisJS Relationships
 * Testing database relationships (@hasOne, @hasMany, @belongsTo, @manyToMany)
 */

// Learning routes for testing database relationships
Route.group(() => {
  Route.post('/create-sample-data', 'Database Learning/LearningController.createSampleData')
  Route.get('/has-one-examples', 'Database Learning/LearningController.hasOneExamples')
  Route.get('/has-many-examples', 'Database Learning/LearningController.hasManyExamples')
  Route.get('/belongs-to-examples', 'Database Learning/LearningController.belongsToExamples')
  Route.get('/many-to-many-examples', 'Database Learning/LearningController.manyToManyExamples')
  Route.get('/advanced-queries', 'Database Learning/LearningController.advancedQueries')
  Route.delete('/cleanup-data', 'Database Learning/LearningController.cleanupData')
}).prefix('/api/v1/learning')



/**
 * HOW TO TEST THE RELATIONSHIPS:
 * 
 * 1. First, create sample data:
 *    POST http://localhost:3333/api/v1/learning/create-sample-data
 * 
 * 2. Test different relationship types:
 *    GET http://localhost:3333/api/v1/learning/has-one-examples
 *    GET http://localhost:3333/api/v1/learning/has-many-examples
 *    GET http://localhost:3333/api/v1/learning/belongs-to-examples
 *    GET http://localhost:3333/api/v1/learning/many-to-many-examples
 *    GET http://localhost:3333/api/v1/learning/advanced-queries
 * 
 * 3. Clean up when done:
 *    DELETE http://localhost:3333/api/v1/learning/cleanup-data
 * 
 * EXAMPLES OF WHAT EACH ENDPOINT DEMONSTRATES:
 * 
 * - create-sample-data: Creates users, profiles, posts, and tags with relationships
 * - has-one-examples: User hasOne Profile relationship examples
 * - has-many-examples: User hasMany Posts relationship examples  
 * - belongs-to-examples: Post belongsTo User, Profile belongsTo User examples
 * - many-to-many-examples: Post manyToMany Tags relationship examples
 * - advanced-queries: Complex queries with nested relationships, counts, etc.
 * - cleanup-data: Removes all test data from the database
 */
