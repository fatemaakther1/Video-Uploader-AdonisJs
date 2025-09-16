import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('/create-user-with-profile', 'Database Learning/RelationshipsController.createUserWithProfile')
  Route.get('/user/:id/with-profile', 'Database Learning/RelationshipsController.getUserWithProfile')
  Route.put('/user/:id/update-profile', 'Database Learning/RelationshipsController.updateUserProfile')
  Route.post('/user/:userId/create-posts', 'Database Learning/RelationshipsController.createPostsForUser')
  Route.get('/user/:id/with-posts', 'Database Learning/RelationshipsController.getUserWithPosts')
  Route.get('/post/:id/with-user', 'Database Learning/RelationshipsController.getPostWithUser')
  Route.get('/user/:userId/published-posts', 'Database Learning/RelationshipsController.getPublishedPostsByUser')
  Route.post('/post/:postId/attach-tags', 'Database Learning/RelationshipsController.attachTagsToPost')
  Route.get('/post/:id/with-tags', 'Database Learning/RelationshipsController.getPostWithTags')
  Route.get('/tag/:id/with-posts', 'Database Learning/RelationshipsController.getTagWithPosts')
  Route.put('/post/:postId/sync-tags', 'Database Learning/RelationshipsController.syncTagsWithPost')
  Route.delete('/post/:postId/detach-tags', 'Database Learning/RelationshipsController.detachTagsFromPost')
  Route.post('/create-sample-tags', 'Database Learning/RelationshipsController.createSampleTags')
  Route.delete('/cleanup-all', 'Database Learning/RelationshipsController.cleanupAll')
}).prefix('api/v1/learning')
