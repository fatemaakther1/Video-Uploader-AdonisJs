import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

import Post from 'App/Models/Post'
import Tag from 'App/Models/Tag'
import Database from '@ioc:Adonis/Lucid/Database'

export default class RelationshipQueries {

  // ==============================================
  // ONE-TO-ONE RELATIONSHIP QUERIES (User ↔ Profile)
  // ==============================================

  /**
   * Create user and profile in one operation using relationship
   */
  public async createUserWithProfile(ctx: HttpContextContract) {
    const user = await User.create({
      email: ctx.request.input('email'),
      username: ctx.request.input('username'),
      password: ctx.request.input('password'),
      firstName: ctx.request.input('firstName'),
      lastName: ctx.request.input('lastName'),
      isActive: true
    })

    const profile = await user.related('profile').create({
      bio: ctx.request.input('bio'),
      avatarUrl: ctx.request.input('avatarUrl'),
      website: ctx.request.input('website'),
      location: ctx.request.input('location'),
      phoneNumber: ctx.request.input('phoneNumber')
    })

    return { user, profile }
  }

  /**
   * Get user with profile using preload (ONE-TO-ONE)
   */
  public async getUserWithProfile(ctx: HttpContextContract) {
    return await User.query()
      .where('id', ctx.params.id)
      .preload('profile')
      .firstOrFail()
  }

  /**
   * Update profile through user relationship
   */
  public async updateUserProfile(ctx: HttpContextContract) {
    const user = await User.findOrFail(ctx.params.id)
    const profile = await user.related('profile').query().firstOrFail()
    
    await Database
      .from('profiles')
      .where('id', profile.id)
      .update({
        ...ctx.request.only(['bio', 'avatarUrl', 'website', 'location', 'phoneNumber']),
        updated_at: new Date()
      })

    return await Database.from('profiles').where('id', profile.id).first()
  }

  // ==============================================
  // ONE-TO-MANY RELATIONSHIP QUERIES (User → Posts)
  // ==============================================

  /**
   * Create multiple posts for a user using ONE-TO-MANY relationship
   */
  public async createPostsForUser(ctx: HttpContextContract) {
    const user = await User.findOrFail(ctx.params.userId)
    const postsData = ctx.request.input('posts', [])
    const posts: Post[] = []
    
    for (const postData of postsData) {
      posts.push(await user.related('posts').create(postData))
    }

    return { user, posts }
  }

  /**
   * Get user with all posts using preload (ONE-TO-MANY)
   */
  public async getUserWithPosts(ctx: HttpContextContract) {
    return await User.query()
      .where('id', ctx.params.id)
      .preload('posts', query => query.orderBy('createdAt', 'desc'))
      .firstOrFail()
  }

  /**
   * Get post with user using BELONGS-TO relationship
   */
  public async getPostWithUser(ctx: HttpContextContract) {
    return await Post.query()
      .where('id', ctx.params.id)
      .preload('user')
      .firstOrFail()
  }

  /**
   * Get published posts by user
   */
  public async getPublishedPostsByUser(ctx: HttpContextContract) {
    const user = await User.findOrFail(ctx.params.userId)
    const publishedPosts = await user.related('posts').query()
      .where('isPublished', true)
      .orderBy('createdAt', 'desc')

    return { user, publishedPosts }
  }

  // ==============================================
  // MANY-TO-MANY RELATIONSHIP QUERIES (Posts ↔ Tags)
  // ==============================================

  /**
   * Attach tags to post using MANY-TO-MANY relationship
   */
  public async attachTagsToPost(ctx: HttpContextContract) {
    const post = await Post.findOrFail(ctx.params.postId)
    const tagIds = ctx.request.input('tagIds', [])
    const pivotData = ctx.request.input('pivotData', {})

    if (Object.keys(pivotData).length > 0) {
      const tags = {}
      tagIds.forEach((tagId, index) => {
        tags[tagId] = {
          sortOrder: pivotData.sortOrder + index || index + 1,
          isPrimary: index === 0 && pivotData.isPrimary || false
        }
      })
      await post.related('tags').attach(tags)
    } else {
      await post.related('tags').attach(tagIds)
    }

    await post.load('tags')
    return post
  }

  /**
   * Get post with tags using MANY-TO-MANY relationship
   */
  public async getPostWithTags(ctx: HttpContextContract) {
    return await Post.query()
      .where('id', ctx.params.id)
      .preload('tags', query => query.pivotColumns(['sortOrder', 'isPrimary']))
      .firstOrFail()
  }

  /**
   * Get tag with posts using MANY-TO-MANY relationship
   */
  public async getTagWithPosts(ctx: HttpContextContract) {
    return await Tag.query()
      .where('id', ctx.params.id)
      .preload('posts', query => {
        query.pivotColumns(['sortOrder', 'isPrimary'])
        query.orderBy('createdAt', 'desc')
      })
      .firstOrFail()
  }

  /**
   * Sync tags with post (replace all existing)
   */
  public async syncTagsWithPost(ctx: HttpContextContract) {
    const post = await Post.findOrFail(ctx.params.postId)
    const tagIds = ctx.request.input('tagIds', [])
    const pivotData = ctx.request.input('pivotData', {})

    if (Object.keys(pivotData).length > 0) {
      const tags = {}
      tagIds.forEach((tagId, index) => {
        tags[tagId] = {
          sortOrder: pivotData.sortOrder + index || index + 1,
          isPrimary: index === 0 && pivotData.isPrimary || false
        }
      })
      await post.related('tags').sync(tags)
    } else {
      await post.related('tags').sync(tagIds)
    }

    await post.load('tags')
    return post
  }

  /**
   * Detach tags from post
   */
  public async detachTagsFromPost(ctx: HttpContextContract) {
    const post = await Post.findOrFail(ctx.params.postId)
    const tagIds = ctx.request.input('tagIds', [])

    if (tagIds.length > 0) {
      await post.related('tags').detach(tagIds)
    } else {
      await post.related('tags').detach()
    }

    await post.load('tags')
    return post
  }

  // ==============================================
  // ADVANCED RELATIONSHIP QUERIES
  // ==============================================

  /**
   * Get posts by tag using whereHas (MANY-TO-MANY filtering)
   */
  public async getPostsByTag(ctx: HttpContextContract) {
    const tag = await Tag.findOrFail(ctx.params.tagId)
    const posts = await Post.query()
      .whereHas('tags', query => query.where('tags.id', ctx.params.tagId))
      .preload('user')
      .preload('tags')
      .orderBy('createdAt', 'desc')

    return { tag, posts }
  }

  /**
   * Get posts with ALL specified tags
   */
  public async getPostsWithAllTags(ctx: HttpContextContract) {
    const tagIds = ctx.request.input('tagIds', [])
    let query = Post.query()

    tagIds.forEach(tagId => {
      query = query.whereHas('tags', tagsQuery => tagsQuery.where('tags.id', tagId))
    })

    const posts = await query
      .preload('user')
      .preload('tags')
      .orderBy('createdAt', 'desc')

    return { requiredTagIds: tagIds, posts }
  }

  /**
   * Get popular tags using withCount
   */
  public async getPopularTags(ctx: HttpContextContract) {
    return await Tag.query()
      .withCount('posts')
      .orderBy('postsCount', 'desc')
      .limit(ctx.request.input('limit', 10))
  }

  /**
   * Get user posts statistics
   */
  public async getUserPostsStats(ctx: HttpContextContract) {
    const user = await User.findOrFail(ctx.params.userId)

    const [totalPosts, publishedPosts, totalViews, latestPost] = await Promise.all([
      user.related('posts').query().count('* as total'),
      user.related('posts').query().where('isPublished', true).count('* as total'),
      user.related('posts').query().sum('viewCount as totalViews'),
      user.related('posts').query().orderBy('createdAt', 'desc').first()
    ])

    return {
      user,
      stats: {
        totalPosts: totalPosts[0].$extras.total,
        publishedPosts: publishedPosts[0].$extras.total,
        totalViews: totalViews[0].$extras.totalViews || 0,
        latestPost
      }
    }
  }

  // ==============================================
  // CLEANUP
  // ==============================================

  /**
   * Clean all data using query builder
   */
  public async cleanupAll(ctx: HttpContextContract) {
    await Database.from('post_tag').del()
    await Database.from('tags').del()
    await Database.from('posts').del()
    await Database.from('profiles').del()
    await Database.from('users').del()

    return {
      message: 'All relationship data cleaned up successfully',
      deletedRelationships: ['MANY-TO-MANY (post_tag)', 'ONE-TO-MANY (user→posts)', 'ONE-TO-ONE (user↔profile)']
    }
  }
}