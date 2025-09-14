import Route from '@ioc:Adonis/Core/Route'

/**
 * Learning Routes for AdonisJS Relationships
 * Add these routes to your main routes file (start/routes.ts)
 */

// Group all learning routes under /api/learning prefix
Route.group(() => {
  
  // Setup and cleanup routes
  Route.post('/setup', 'Database Learning/LearningController.createSampleData')
  Route.delete('/cleanup', 'Database Learning/LearningController.cleanupData')
  
  // Relationship example routes
  Route.get('/has-one', 'Database Learning/LearningController.hasOneExamples')
  Route.get('/has-many', 'Database Learning/LearningController.hasManyExamples')
  Route.get('/belongs-to', 'Database Learning/LearningController.belongsToExamples')
  Route.get('/many-to-many', 'Database Learning/LearningController.manyToManyExamples')
  Route.get('/advanced', 'Database Learning/LearningController.advancedQueries')
  
}).prefix('/api/learning')

/**
 * COPY THESE ROUTES TO YOUR start/routes.ts FILE:
 * 
 * // Learning Routes for AdonisJS Relationships
 * Route.group(() => {
 *   Route.post('/setup', 'Database Learning/LearningController.createSampleData')
 *   Route.delete('/cleanup', 'Database Learning/LearningController.cleanupData')
 *   Route.get('/has-one', 'Database Learning/LearningController.hasOneExamples')
 *   Route.get('/has-many', 'Database Learning/LearningController.hasManyExamples')
 *   Route.get('/belongs-to', 'Database Learning/LearningController.belongsToExamples')
 *   Route.get('/many-to-many', 'Database Learning/LearningController.manyToManyExamples')
 *   Route.get('/advanced', 'Database Learning/LearningController.advancedQueries')
 * }).prefix('/api/learning')
 */

/**
 * HOW TO TEST THE RELATIONSHIPS:
 * 
 * 1. First, create sample data:
 *    POST http://localhost:3333/api/learning/setup
 * 
 * 2. Test different relationship types:
 *    GET http://localhost:3333/api/learning/has-one
 *    GET http://localhost:3333/api/learning/has-many
 *    GET http://localhost:3333/api/learning/belongs-to
 *    GET http://localhost:3333/api/learning/many-to-many
 *    GET http://localhost:3333/api/learning/advanced
 * 
 * 3. Clean up when done:
 *    DELETE http://localhost:3333/api/learning/cleanup
 */
