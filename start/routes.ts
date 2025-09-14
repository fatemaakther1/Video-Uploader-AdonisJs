/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'
import '../app/Controllers/Http/Video/videoRoutes'

Route.get('/', async () => {
  return { hello: 'world' }
})

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
