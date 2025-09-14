import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Profile from 'App/Models/Profile'
import Post from 'App/Models/Post'
import Tag from 'App/Models/Tag'
import Database from '@ioc:Adonis/Lucid/Database'

/**
 * Learning Controller for AdonisJS Relationships
 * This demonstrates @hasOne, @hasMany, @belongsTo, @manyToMany
 */
export default class LearningController {
  
  // ==============================================
  // CREATE SAMPLE DATA FOR LEARNING
  // ==============================================
  
  public async createSampleData({ response }: HttpContextContract) {
    try {
      // Create a user
      const user = await User.create({
        email: 'john@example.com',
        username: 'john_doe',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
      })

      // Create profile for user (@hasOne relationship)
      const profile = await Profile.create({
        userId: user.id,
        bio: 'Full-stack developer passionate about AdonisJS',
        avatarUrl: 'https://example.com/avatar.jpg',
        website: 'https://johndoe.dev',
        location: 'New York, USA',
      })

      // Create posts for user (@hasMany relationship)
      const post1 = await Post.create({
        userId: user.id,
        title: 'Learning AdonisJS Relationships',
        content: 'This is a comprehensive guide to understanding relationships in AdonisJS...',
        slug: 'learning-adonisjs-relationships',
        isPublished: true,
        viewCount: 150,
      })

      const post2 = await Post.create({
        userId: user.id,
        title: 'Database Queries with Lucid ORM',
        content: 'Lucid ORM provides powerful features for database interactions...',
        slug: 'database-queries-lucid-orm',
        isPublished: true,
        viewCount: 89,
      })

      // Create tags (@manyToMany relationship)
      const tagAdonisJS = await Tag.create({
        name: 'AdonisJS',
        color: '#4F46E5',
        description: 'Node.js framework for building web applications',
      })

      const tagDatabase = await Tag.create({
        name: 'Database',
        color: '#059669',
        description: 'Database related topics and tutorials',
      })

      const tagTutorial = await Tag.create({
        name: 'Tutorial',
        color: '#DC2626',
        description: 'Step by step learning guides',
      })

      // Attach tags to posts (many-to-many relationships)
      await post1.related('tags').attach({
        [tagAdonisJS.id]: { sortOrder: 1, isPrimary: true },
        [tagTutorial.id]: { sortOrder: 2, isPrimary: false },
      })

      await post2.related('tags').attach({
        [tagAdonisJS.id]: { sortOrder: 1, isPrimary: true },
        [tagDatabase.id]: { sortOrder: 2, isPrimary: false },
        [tagTutorial.id]: { sortOrder: 3, isPrimary: false },
      })

      return response.json({
        message: 'Sample data created successfully!',
        data: {
          user: user.toJSON(),
          profile: profile.toJSON(),
          posts: [post1.toJSON(), post2.toJSON()],
          tags: [tagAdonisJS.toJSON(), tagDatabase.toJSON(), tagTutorial.toJSON()],
        }
      })
    } catch (error) {
      return response.status(500).json({
        error: 'Failed to create sample data',
        details: error.message
      })
    }
  }

  // ==============================================
  // @hasOne RELATIONSHIP EXAMPLES
  // ==============================================

  /**
   * Demonstrates @hasOne relationship
   * User hasOne Profile
   */
  public async hasOneExamples({ response }: HttpContextContract) {
    try {
      // 1. Load user with profile using preload
      const userWithProfile = await User.query()
        .preload('profile') // Eager loading
        .first()

      // 2. Load profile through relationship (lazy loading)
      const user = await User.first()
      if (user) {
        await user.load('profile')
        // Or use: const profile = await user.related('profile').query().first()
      }

      // 3. Create profile for existing user
      const existingUser = await User.first()
      if (existingUser) {
        const newProfile = await existingUser.related('profile').create({
          bio: 'Updated bio through relationship',
          website: 'https://newsite.com',
        })
      }

      // 4. Check if user has profile
      const userToCheck = await User.first()
      let hasProfile = false
      if (userToCheck) {
        const profileExists = await userToCheck.related('profile').query().first()
        hasProfile = !!profileExists
      }

      return response.json({
        message: '@hasOne relationship examples',
        examples: {
          userWithProfile: userWithProfile?.toJSON(),
          userAfterLoad: user?.toJSON(),
          hasProfile,
        }
      })
    } catch (error) {
      return response.status(500).json({
        error: 'hasOne examples failed',
        details: error.message
      })
    }
  }

  // ==============================================
  // @hasMany RELATIONSHIP EXAMPLES
  // ==============================================

  /**
   * Demonstrates @hasMany relationship
   * User hasMany Posts
   */
  public async hasManyExamples({ response }: HttpContextContract) {
    try {
      // 1. Load user with all posts
      const userWithPosts = await User.query()
        .preload('posts') // Load all posts
        .first()

      // 2. Load user with filtered posts
      const userWithPublishedPosts = await User.query()
        .preload('posts', (postsQuery) => {
          postsQuery.where('is_published', true)
          postsQuery.orderBy('view_count', 'desc')
        })
        .first()

      // 3. Count posts for a user
      const user = await User.first()
      let postsCount = 0
      if (user) {
        const result = await user.related('posts').query().count('* as total')
        postsCount = Array.isArray(result) ? result[0]['total'] : 0
      }

      // 4. Create new post for user
      const userForNewPost = await User.first()
      let newPost: Post | null = null
      if (userForNewPost) {
        newPost = await userForNewPost.related('posts').create({
          title: 'New Post Created via Relationship',
          content: 'This post was created using the hasMany relationship',
          slug: 'new-post-via-relationship',
          isPublished: false,
        })
      }

      // 5. Paginate user's posts
      const userWithPaginatedPosts = await User.first()
      let paginatedPosts: any = null
      if (userWithPaginatedPosts) {
        paginatedPosts = await userWithPaginatedPosts
          .related('posts')
          .query()
          .orderBy('created_at', 'desc')
          .paginate(1, 2)
      }

      return response.json({
        message: '@hasMany relationship examples',
        examples: {
          userWithPosts: userWithPosts?.toJSON(),
          userWithPublishedPosts: userWithPublishedPosts?.toJSON(),
          postsCount: postsCount,
          newPost: newPost?.toJSON(),
          paginatedPosts: paginatedPosts?.toJSON(),
        }
      })
    } catch (error) {
      return response.status(500).json({
        error: 'hasMany examples failed',
        details: error.message
      })
    }
  }

  // ==============================================
  // @belongsTo RELATIONSHIP EXAMPLES
  // ==============================================

  /**
   * Demonstrates @belongsTo relationship
   * Post belongsTo User, Profile belongsTo User
   */
  public async belongsToExamples({ response }: HttpContextContract) {
    try {
      // 1. Load post with its author (user)
      const postWithAuthor = await Post.query()
        .preload('user') // Load the user who created this post
        .first()

      // 2. Load profile with its user
      const profileWithUser = await Profile.query()
        .preload('user')
        .first()

      // 3. Get user through post relationship (lazy loading)
      const post = await Post.first()
      let postAuthor = null
      if (post) {
        await post.load('user')
        postAuthor = post.user
      }

      // 4. Associate post with different user
      const postToUpdate = await Post.first()
      const newUser = await User.create({
        email: 'jane@example.com',
        username: 'jane_doe',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Doe',
      })
      
      if (postToUpdate) {
        await postToUpdate.related('user').associate(newUser)
      }

      // 5. Query posts by user email (join through relationship)
      const postsByUserEmail = await Post.query()
        .preload('user')
        .whereHas('user', (userQuery) => {
          userQuery.where('email', 'john@example.com')
        })

      return response.json({
        message: '@belongsTo relationship examples',
        examples: {
          postWithAuthor: postWithAuthor?.toJSON(),
          profileWithUser: profileWithUser?.toJSON(),
          postAuthor: postAuthor?.toJSON(),
          postsByUserEmail: postsByUserEmail.map(p => p.toJSON()),
        }
      })
    } catch (error) {
      return response.status(500).json({
        error: 'belongsTo examples failed',
        details: error.message
      })
    }
  }

  // ==============================================
  // @manyToMany RELATIONSHIP EXAMPLES
  // ==============================================

  /**
   * Demonstrates @manyToMany relationship
   * Post manyToMany Tags
   */
  public async manyToManyExamples({ response }: HttpContextContract) {
    try {
      // 1. Load post with all its tags
      const postWithTags = await Post.query()
        .preload('tags') // Load all related tags
        .first()

      // 2. Load post with tags including pivot data
      const postWithTagsAndPivot = await Post.query()
        .preload('tags', (tagsQuery) => {
          tagsQuery.pivotColumns(['sort_order', 'is_primary']) // Include pivot columns
        })
        .first()

      // 3. Load tag with all its posts
      const tagWithPosts = await Tag.query()
        .preload('posts')
        .where('name', 'AdonisJS')
        .first()

      // 4. Attach new tags to a post
      const post = await Post.first()
      const jsTag = await Tag.create({
        name: 'JavaScript',
        color: '#F59E0B',
        description: 'JavaScript programming language'
      })

      if (post) {
        await post.related('tags').attach({
          [jsTag.id]: { 
            sortOrder: 4, 
            isPrimary: false 
          }
        })
      }

      // 5. Sync tags (replace all existing with new ones)
      const postToSync = await Post.query().offset(1).first() // Get second post
      if (postToSync) {
        const existingTags = await Tag.query().limit(2)
        const tagIds = existingTags.reduce((acc, tag) => {
          acc[tag.id] = { sortOrder: 1, isPrimary: true }
          return acc
        }, {})
        
        await postToSync.related('tags').sync(tagIds)
      }

      // 6. Detach specific tags
      const postToDetach = await Post.first()
      if (postToDetach) {
        const tagToRemove = await Tag.query().where('name', 'JavaScript').first()
        if (tagToRemove) {
          await postToDetach.related('tags').detach([tagToRemove.id])
        }
      }

      // 7. Query posts that have specific tags
      const postsWithAdonisTag = await Post.query()
        .preload('tags')
        .whereHas('tags', (tagsQuery) => {
          tagsQuery.where('name', 'AdonisJS')
        })

      // 8. Query with pivot table conditions
      const postsWithPrimaryAdonisTag = await Post.query()
        .preload('tags')
        .whereHas('tags', (tagsQuery) => {
          tagsQuery.where('name', 'AdonisJS')
          tagsQuery.wherePivot('is_primary', true)
        })

      // 9. Count tags for a post
      const postForCount = await Post.first()
      let tagsCount = 0
      if (postForCount) {
        const result = await postForCount.related('tags').query().count('* as total')
        tagsCount = Array.isArray(result) ? result[0]['total'] : 0
      }

      return response.json({
        message: '@manyToMany relationship examples',
        examples: {
          postWithTags: postWithTags?.toJSON(),
          postWithTagsAndPivot: postWithTagsAndPivot?.toJSON(),
          tagWithPosts: tagWithPosts?.toJSON(),
          postsWithAdonisTag: postsWithAdonisTag.map(p => p.toJSON()),
          postsWithPrimaryAdonisTag: postsWithPrimaryAdonisTag.map(p => p.toJSON()),
          tagsCount: tagsCount,
        }
      })
    } catch (error) {
      return response.status(500).json({
        error: 'manyToMany examples failed',
        details: error.message
      })
    }
  }

  // ==============================================
  // ADVANCED QUERY EXAMPLES
  // ==============================================

  /**
   * Advanced relationship queries
   */
  public async advancedQueries({ response }: HttpContextContract) {
    try {
      // 1. Nested relationships (user -> posts -> tags)
      const userWithNestedData = await User.query()
        .preload('profile')
        .preload('posts', (postsQuery) => {
          postsQuery.preload('tags')
          postsQuery.where('is_published', true)
        })
        .first()

      // 2. Count related records
      const usersWithCounts = await User.query()
        .withCount('posts')
        .withCount('posts', (query) => {
          query.where('is_published', true)
        })

      // 3. Using whereHas with multiple conditions
      const activeUsersWithPublishedPosts = await User.query()
        .where('is_active', true)
        .whereHas('posts', (postsQuery) => {
          postsQuery.where('is_published', true)
          postsQuery.where('view_count', '>', 100)
        })

      // 4. Using orWhereHas
      const usersWithProfileOrPosts = await User.query()
        .whereHas('profile', (query) => {})
        .orWhereHas('posts', (query) => {})

      // 5. Using doesntHave (opposite of whereHas)
      const usersWithoutProfile = await User.query()
        .doesntHave('profile')

      // 6. Raw queries with relationships
      const popularPostsWithAuthors = await Database
        .from('posts')
        .join('users', 'posts.user_id', 'users.id')
        .where('posts.view_count', '>', 50)
        .select('posts.title', 'posts.view_count', 'users.username')

      // 7. Aggregate functions with relationships
      const userPostStats = await User.query()
        .join('posts', 'users.id', 'posts.user_id')
        .groupBy('users.id', 'users.username')
        .select('users.id', 'users.username')
        .count('posts.id as posts_count')
        .sum('posts.view_count as total_views')
        .avg('posts.view_count as avg_views')

      return response.json({
        message: 'Advanced relationship queries',
        examples: {
          userWithNestedData: userWithNestedData?.toJSON(),
          usersWithCounts: usersWithCounts.map(u => u.toJSON()),
          activeUsersWithPublishedPosts: activeUsersWithPublishedPosts.map(u => u.toJSON()),
          usersWithProfileOrPosts: usersWithProfileOrPosts.map(u => u.toJSON()),
          usersWithoutProfile: usersWithoutProfile.map(u => u.toJSON()),
          popularPostsWithAuthors,
          userPostStats,
        }
      })
    } catch (error) {
      return response.status(500).json({
        error: 'Advanced queries failed',
        details: error.message
      })
    }
  }

  // ==============================================
  // CLEANUP METHOD
  // ==============================================

  public async cleanupData({ response }: HttpContextContract) {
    try {
      // Delete in correct order to respect foreign key constraints
      await Database.table('post_tag').delete()
      await Tag.query().delete()
      await Post.query().delete()
      await Profile.query().delete()
      await User.query().delete()

      return response.json({
        message: 'All learning data cleaned up successfully!'
      })
    } catch (error) {
      return response.status(500).json({
        error: 'Failed to cleanup data',
        details: error.message
      })
    }
  }
}
