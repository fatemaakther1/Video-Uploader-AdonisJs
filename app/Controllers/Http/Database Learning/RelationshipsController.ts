import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RelationshipQueries from './RelationshipQueries'

export default class RelationshipsController {
  private queries: RelationshipQueries
  
  constructor() {
    this.queries = new RelationshipQueries()
  }

  // ==============================================
  // ONE-TO-ONE RELATIONSHIP METHODS (User ↔ Profile)
  // Each User has exactly one Profile
  // Each Profile belongs to exactly one User
  // ==============================================

  /**
   * Create user with profile in one operation
   * POST /api/v1/learning/create-user-with-profile
   */
  public async createUserWithProfile(ctx: HttpContextContract) {
    const result = await this.queries.createUserWithProfile(ctx)
    
    return ctx.response.status(201).json({
      success: true,
      message: 'User with profile created successfully using ONE-TO-ONE relationship',
      data: result,
      relationshipType: 'ONE-TO-ONE (User ↔ Profile)'
    })
  }

  /**
   * Get user with profile loaded
   * GET /api/v1/learning/user/:id/with-profile
   */
  public async getUserWithProfile(ctx: HttpContextContract) {
    const user = await this.queries.getUserWithProfile(ctx)
    
    return ctx.response.json({
      success: true,
      message: 'User with profile retrieved using ONE-TO-ONE relationship',
      data: user,
      relationshipType: 'ONE-TO-ONE (User ↔ Profile)'
    })
  }

  /**
   * Update user profile through relationship
   * PUT /api/v1/learning/user/:id/update-profile
   */
  public async updateUserProfile(ctx: HttpContextContract) {
    const profile = await this.queries.updateUserProfile(ctx)
    
    return ctx.response.json({
      success: true,
      message: 'Profile updated through ONE-TO-ONE relationship',
      data: profile,
      relationshipType: 'ONE-TO-ONE (User ↔ Profile)'
    })
  }

  // ==============================================
  // ONE-TO-MANY RELATIONSHIP METHODS (User → Posts)
  // One User can have many Posts
  // Each Post belongs to one User (BELONGS-TO reverse)
  // ==============================================

  /**
   * Create multiple posts for a user
   * POST /api/v1/learning/user/:userId/create-posts
   */
  public async createPostsForUser(ctx: HttpContextContract) {
    const result = await this.queries.createPostsForUser(ctx)
    
    return ctx.response.status(201).json({
      success: true,
      message: `${result.posts.length} posts created using ONE-TO-MANY relationship`,
      data: result,
      relationshipType: 'ONE-TO-MANY (User → Posts)'
    })
  }

  /**
   * Get user with all posts
   * GET /api/v1/learning/user/:id/with-posts
   */
  public async getUserWithPosts(ctx: HttpContextContract) {
    const user = await this.queries.getUserWithPosts(ctx)
    
    return ctx.response.json({
      success: true,
      message: 'User with posts retrieved using ONE-TO-MANY relationship',
      data: {
        user: user,
        postsCount: user.posts.length
      },
      relationshipType: 'ONE-TO-MANY (User → Posts)'
    })
  }

  /**
   * Get post with its user (BELONGS-TO relationship)
   * GET /api/v1/learning/post/:id/with-user
   */
  public async getPostWithUser(ctx: HttpContextContract) {
    const post = await this.queries.getPostWithUser(ctx)
    
    return ctx.response.json({
      success: true,
      message: 'Post with user retrieved using BELONGS-TO relationship',
      data: post,
      relationshipType: 'BELONGS-TO (Post → User, reverse of ONE-TO-MANY)'
    })
  }

  /**
   * Get published posts by user
   * GET /api/v1/learning/user/:userId/published-posts
   */
  public async getPublishedPostsByUser(ctx: HttpContextContract) {
    const result = await this.queries.getPublishedPostsByUser(ctx)
    
    return ctx.response.json({
      success: true,
      message: 'Published posts retrieved using ONE-TO-MANY relationship with filtering',
      data: {
        user: result.user,
        publishedPosts: result.publishedPosts,
        count: result.publishedPosts.length
      },
      relationshipType: 'ONE-TO-MANY (User → Posts) with WHERE filter'
    })
  }

  // ==============================================
  // MANY-TO-MANY RELATIONSHIP METHODS (Posts ↔ Tags)
  // One Post can have many Tags
  // One Tag can be attached to many Posts
  // Uses pivot table: post_tag with additional columns (sortOrder, isPrimary)
  // ==============================================

  /**
   * Attach tags to post with optional pivot data
   * POST /api/v1/learning/post/:postId/attach-tags
   */
  public async attachTagsToPost(ctx: HttpContextContract) {
    const post = await this.queries.attachTagsToPost(ctx)
    
    return ctx.response.json({
      success: true,
      message: 'Tags attached to post using MANY-TO-MANY relationship',
      data: {
        post: post,
        attachedTagsCount: post.tags.length
      },
      relationshipType: 'MANY-TO-MANY (Posts ↔ Tags) with pivot data'
    })
  }

  /**
   * Get post with all tags and pivot data
   * GET /api/v1/learning/post/:id/with-tags
   */
  public async getPostWithTags(ctx: HttpContextContract) {
    const post = await this.queries.getPostWithTags(ctx)
    
    return ctx.response.json({
      success: true,
      message: 'Post with tags retrieved using MANY-TO-MANY relationship',
      data: {
        post: post,
        tagsCount: post.tags.length
      },
      relationshipType: 'MANY-TO-MANY (Posts ↔ Tags) with pivot columns'
    })
  }

  /**
   * Get tag with all posts (reverse direction)
   * GET /api/v1/learning/tag/:id/with-posts
   */
  public async getTagWithPosts(ctx: HttpContextContract) {
    const tag = await this.queries.getTagWithPosts(ctx)
    
    return ctx.response.json({
      success: true,
      message: 'Tag with posts retrieved using MANY-TO-MANY relationship',
      data: {
        tag: tag,
        postsCount: tag.posts.length
      },
      relationshipType: 'MANY-TO-MANY (Tags ↔ Posts) reverse direction'
    })
  }

  /**
   * Sync tags with post (replace all existing tags)
   * PUT /api/v1/learning/post/:postId/sync-tags
   */
  public async syncTagsWithPost(ctx: HttpContextContract) {
    const post = await this.queries.syncTagsWithPost(ctx)
    
    return ctx.response.json({
      success: true,
      message: 'Tags synced with post using MANY-TO-MANY relationship',
      data: {
        post: post,
        syncedTagsCount: post.tags.length
      },
      relationshipType: 'MANY-TO-MANY (Posts ↔ Tags) SYNC operation'
    })
  }

  /**
   * Detach tags from post
   * DELETE /api/v1/learning/post/:postId/detach-tags
   */
  public async detachTagsFromPost(ctx: HttpContextContract) {
    const post = await this.queries.detachTagsFromPost(ctx)
    const tagIds = ctx.request.input('tagIds', [])
    
    return ctx.response.json({
      success: true,
      message: tagIds.length > 0 
        ? `${tagIds.length} tags detached using MANY-TO-MANY relationship` 
        : 'All tags detached using MANY-TO-MANY relationship',
      data: {
        post: post,
        remainingTagsCount: post.tags.length
      },
      relationshipType: 'MANY-TO-MANY (Posts ↔ Tags) DETACH operation'
    })
  }

  // ==============================================
  // ADVANCED RELATIONSHIP QUERY METHODS
  // Demonstrates complex relationship filtering and aggregation
  // ==============================================

  /**
   * Get posts by tag using whereHas
   * GET /api/v1/learning/posts-by-tag/:tagId
   */
  public async getPostsByTag(ctx: HttpContextContract) {
    const result = await this.queries.getPostsByTag(ctx)
    
    return ctx.response.json({
      success: true,
      message: `Posts filtered by tag using MANY-TO-MANY relationship with whereHas`,
      data: {
        tag: result.tag,
        posts: result.posts,
        postsCount: result.posts.length
      },
      relationshipType: 'MANY-TO-MANY (Posts ↔ Tags) with whereHas filtering'
    })
  }

  /**
   * Get posts that have ALL specified tags
   * POST /api/v1/learning/posts-with-all-tags
   */
  public async getPostsWithAllTags(ctx: HttpContextContract) {
    const result = await this.queries.getPostsWithAllTags(ctx)
    
    return ctx.response.json({
      success: true,
      message: 'Posts with ALL specified tags using MANY-TO-MANY relationship',
      data: {
        requiredTagIds: result.requiredTagIds,
        posts: result.posts,
        postsCount: result.posts.length
      },
      relationshipType: 'MANY-TO-MANY (Posts ↔ Tags) with multiple whereHas (AND condition)'
    })
  }

  /**
   * Get popular tags by post count
   * GET /api/v1/learning/popular-tags
   */
  public async getPopularTags(ctx: HttpContextContract) {
    const tags = await this.queries.getPopularTags(ctx)
    
    return ctx.response.json({
      success: true,
      message: 'Popular tags retrieved using MANY-TO-MANY relationship with aggregation',
      data: {
        tags: tags,
        limit: ctx.request.input('limit', 10)
      },
      relationshipType: 'MANY-TO-MANY (Tags ↔ Posts) with withCount aggregation'
    })
  }

  /**
   * Get user posts statistics
   * GET /api/v1/learning/user/:userId/posts-stats
   */
  public async getUserPostsStats(ctx: HttpContextContract) {
    const result = await this.queries.getUserPostsStats(ctx)
    
    return ctx.response.json({
      success: true,
      message: 'User posts statistics using ONE-TO-MANY relationship queries',
      data: result,
      relationshipType: 'ONE-TO-MANY (User → Posts) with aggregation (count, sum)'
    })
  }

  // ==============================================
  // CLEANUP & UTILITY METHODS
  // ==============================================

  /**
   * Clean all data respecting relationship constraints
   * DELETE /api/v1/learning/cleanup-all
   */
  public async cleanupAll(ctx: HttpContextContract) {
    const result = await this.queries.cleanupAll(ctx)
    
    return ctx.response.json({
      success: true,
      message: 'All relationship data cleaned up in correct order',
      data: result,
      relationshipType: 'ALL (demonstrates proper cleanup order for relationships)'
    })
  }
}