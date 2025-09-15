import Route from '@ioc:Adonis/Core/Route'

// ==============================================
// DATABASE RELATIONSHIPS LEARNING ROUTES
// ==============================================

Route.group(() => {

  // ==============================================
  // ONE-TO-ONE RELATIONSHIP (User ↔ Profile)
  // Each User has exactly one Profile
  // Each Profile belongs to exactly one User
  // ==============================================
  Route.post('/create-user-with-profile', 'Database Learning/RelationshipsController.createUserWithProfile')
  Route.get('/user/:id/with-profile', 'Database Learning/RelationshipsController.getUserWithProfile')
  Route.put('/user/:id/update-profile', 'Database Learning/RelationshipsController.updateUserProfile')

  // ==============================================
  // ONE-TO-MANY RELATIONSHIP (User → Posts)
  // One User can have many Posts
  // Each Post belongs to one User (BelongsTo)
  // ==============================================
  Route.post('/user/:userId/create-posts', 'Database Learning/RelationshipsController.createPostsForUser')
  Route.get('/user/:id/with-posts', 'Database Learning/RelationshipsController.getUserWithPosts')
  Route.get('/post/:id/with-user', 'Database Learning/RelationshipsController.getPostWithUser')
  Route.get('/user/:userId/published-posts', 'Database Learning/RelationshipsController.getPublishedPostsByUser')

  // ==============================================
  // MANY-TO-MANY RELATIONSHIP (Posts ↔ Tags)
  // One Post can have many Tags
  // One Tag can be attached to many Posts
  // Uses pivot table: post_tag with additional columns
  // ==============================================
  Route.post('/post/:postId/attach-tags', 'Database Learning/RelationshipsController.attachTagsToPost')
  Route.get('/post/:id/with-tags', 'Database Learning/RelationshipsController.getPostWithTags')
  Route.get('/tag/:id/with-posts', 'Database Learning/RelationshipsController.getTagWithPosts')
  Route.put('/post/:postId/sync-tags', 'Database Learning/RelationshipsController.syncTagsWithPost')
  Route.delete('/post/:postId/detach-tags', 'Database Learning/RelationshipsController.detachTagsFromPost')

  // ==============================================
  // ADVANCED RELATIONSHIP QUERIES
  // Demonstrates complex relationship filtering and aggregation
  // ==============================================
  Route.get('/posts-by-tag/:tagId', 'Database Learning/RelationshipsController.getPostsByTag')
  Route.post('/posts-with-all-tags', 'Database Learning/RelationshipsController.getPostsWithAllTags')
  Route.get('/popular-tags', 'Database Learning/RelationshipsController.getPopularTags')
  Route.get('/user/:userId/posts-stats', 'Database Learning/RelationshipsController.getUserPostsStats')

  // ==============================================
  // CLEANUP & UTILITY
  // ==============================================
  Route.delete('/cleanup-all', 'Database Learning/RelationshipsController.cleanupAll')

}).prefix('api/v1/learning')
