import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Post from 'App/Models/Post'
import Tag from 'App/Models/Tag'
import Database from '@ioc:Adonis/Lucid/Database'

export default class RelationshipQueries {

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

  public async getUserWithProfile(ctx: HttpContextContract) {
    return await User.query()
      .where('id', ctx.params.id)
      .preload('profile')
      .firstOrFail()
  }

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

  public async createPostsForUser(ctx: HttpContextContract) {
    const user = await User.findOrFail(ctx.params.userId)
    const postsData = ctx.request.input('posts', [])
    const posts: Post[] = []
    
    for (const postData of postsData) {
      posts.push(await user.related('posts').create(postData))
    }

    return { user, posts }
  }

  public async getUserWithPosts(ctx: HttpContextContract) {
    return await User.query()
      .where('id', ctx.params.id)
      .preload('posts', query => query.orderBy('createdAt', 'desc'))
      .firstOrFail()
  }

  public async getPostWithUser(ctx: HttpContextContract) {
    return await Post.query()
      .where('id', ctx.params.id)
      .preload('user')
      .firstOrFail()
  }

  public async getPublishedPostsByUser(ctx: HttpContextContract) {
    const user = await User.findOrFail(ctx.params.userId)
    const publishedPosts = await user.related('posts').query()
      .where('isPublished', true)
      .orderBy('createdAt', 'desc')

    return { user, publishedPosts }
  }

  public async attachTagsToPost(ctx: HttpContextContract) {
    const post = await Post.findOrFail(ctx.params.postId)
    const tagIds = ctx.request.input('tagIds', [])
    const pivotData = ctx.request.input('pivotData', {})

    if (Object.keys(pivotData).length > 0) {
      const tags = {}
      tagIds.forEach((tagId, index) => {
        tags[tagId] = {
          sort_order: pivotData.sort_order + index || index + 1,
          is_primary: index === 0 && pivotData.is_primary || false
        }
      })
      await post.related('tags').attach(tags)
    } else {
      await post.related('tags').attach(tagIds)
    }

    await post.load('tags')
    return post
  }

  public async getPostWithTags(ctx: HttpContextContract) {
    return await Post.query()
      .where('id', ctx.params.id)
      .preload('tags', query => query.pivotColumns(['sort_order', 'is_primary']))
      .firstOrFail()
  }

  public async getTagWithPosts(ctx: HttpContextContract) {
    return await Tag.query()
      .where('id', ctx.params.id)
      .preload('posts', query => {
        query.pivotColumns(['sort_order', 'is_primary'])
        query.orderBy('createdAt', 'desc')
      })
      .firstOrFail()
  }

  public async syncTagsWithPost(ctx: HttpContextContract) {
    const post = await Post.findOrFail(ctx.params.postId)
    const tagIds = ctx.request.input('tagIds', [])
    const pivotData = ctx.request.input('pivotData', {})

    if (Object.keys(pivotData).length > 0) {
      const tags = {}
      tagIds.forEach((tagId, index) => {
        tags[tagId] = {
          sort_order: pivotData.sort_order + index || index + 1,
          is_primary: index === 0 && pivotData.is_primary || false
        }
      })
      await post.related('tags').sync(tags)
    } else {
      await post.related('tags').sync(tagIds)
    }

    await post.load('tags')
    return post
  }

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

  public async createSampleTags(ctx: HttpContextContract) {
    const customTags = ctx.request.input('tags', [])
    
    const defaultSampleTags = [
      { name: 'JavaScript', color: '#F0DB4F', description: 'JavaScript programming language' },
      { name: 'Node.js', color: '#339933', description: 'Node.js runtime environment' },
      { name: 'AdonisJS', color: '#220052', description: 'AdonisJS web framework' },
      { name: 'Database', color: '#336791', description: 'Database related topics' },
      { name: 'Tutorial', color: '#FF6B6B', description: 'Tutorial and learning content' }
    ]

    const tagsToCreate = customTags.length > 0 ? customTags : defaultSampleTags

    const tags: Tag[] = []
    for (const tagData of tagsToCreate) {
      const existingTag = await Tag.query().where('name', tagData.name).first()
      if (!existingTag) {
        if (!tagData.slug) {
          tagData.slug = tagData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')
        }
        const newTag = await Tag.create(tagData)
        tags.push(newTag)
      } else {
        tags.push(existingTag)
      }
    }

    return tags
  }

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
