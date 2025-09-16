import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RelationshipQueries from './RelationshipQueries'

export default class RelationshipsController {
  private queries: RelationshipQueries
  
  constructor() {
    this.queries = new RelationshipQueries()
  }

  public async createUserWithProfile(ctx: HttpContextContract) {
    const result = await this.queries.createUserWithProfile(ctx)
    
    return ctx.response.status(201).json({
      success: true,
      message: 'User with profile created successfully using ONE-TO-ONE relationship',
      data: result,
      relationshipType: 'ONE-TO-ONE (User ↔ Profile)'
    })
  }

  public async getUserWithProfile(ctx: HttpContextContract) {
    const user = await this.queries.getUserWithProfile(ctx)
    
    return ctx.response.json({
      success: true,
      message: 'User with profile retrieved using ONE-TO-ONE relationship',
      data: user,
      relationshipType: 'ONE-TO-ONE (User ↔ Profile)'
    })
  }

  public async updateUserProfile(ctx: HttpContextContract) {
    const profile = await this.queries.updateUserProfile(ctx)
    
    return ctx.response.json({
      success: true,
      message: 'Profile updated through ONE-TO-ONE relationship',
      data: profile,
      relationshipType: 'ONE-TO-ONE (User ↔ Profile)'
    })
  }

  public async createPostsForUser(ctx: HttpContextContract) {
    const result = await this.queries.createPostsForUser(ctx)
    
    return ctx.response.status(201).json({
      success: true,
      message: `${result.posts.length} posts created using ONE-TO-MANY relationship`,
      data: result,
      relationshipType: 'ONE-TO-MANY (User → Posts)'
    })
  }

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

  public async getPostWithUser(ctx: HttpContextContract) {
    const post = await this.queries.getPostWithUser(ctx)
    
    return ctx.response.json({
      success: true,
      message: 'Post with user retrieved using BELONGS-TO relationship',
      data: post,
      relationshipType: 'BELONGS-TO (Post → User, reverse of ONE-TO-MANY)'
    })
  }

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

  public async createSampleTags(ctx: HttpContextContract) {
    const tags = await this.queries.createSampleTags(ctx)
    
    return ctx.response.status(201).json({
      success: true,
      message: 'Sample tags created successfully for MANY-TO-MANY testing',
      data: {
        tags: tags,
        count: tags.length
      },
      relationshipType: 'MANY-TO-MANY (Posts ↔ Tags) - Sample Data Creation'
    })
  }

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
