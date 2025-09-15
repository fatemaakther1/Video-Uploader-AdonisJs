import User from 'App/Models/User'
import Profile from 'App/Models/Profile'
import Post from 'App/Models/Post'
import Tag from 'App/Models/Tag'
import Database from '@ioc:Adonis/Lucid/Database'

export default class LearningQueries {
  
  // ==============================================
  // CREATE SAMPLE DATA OPERATIONS
  // ==============================================
  
  public async createSampleData() {
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
      [tagAdonisJS.id]: { sort_order: 1, is_primary: true },
      [tagTutorial.id]: { sort_order: 2, is_primary: false },
    })

    await post2.related('tags').attach({
      [tagAdonisJS.id]: { sort_order: 1, is_primary: true },
      [tagDatabase.id]: { sort_order: 2, is_primary: false },
      [tagTutorial.id]: { sort_order: 3, is_primary: false },
    })

    return {
      user: user.toJSON(),
      profile: profile.toJSON(),
      posts: [post1.toJSON(), post2.toJSON()],
      tags: [tagAdonisJS.toJSON(), tagDatabase.toJSON(), tagTutorial.toJSON()],
    }
  }

  // ==============================================
  // @hasOne RELATIONSHIP OPERATIONS
  // ==============================================

  public async getHasOneExamples() {
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

    // 3. Create profile for existing user (only if they don't have one)
    const existingUser = await User.first()
    let newProfile: Profile | null = null
    if (existingUser) {
      // Check if user already has a profile
      const existingProfile = await existingUser.related('profile').query().first()
      if (!existingProfile) {
        newProfile = await existingUser.related('profile').create({
          bio: 'Updated bio through relationship',
          website: 'https://newsite.com',
        })
      } else {
        // If profile exists, just update it
        await existingProfile.merge({
          bio: 'Updated bio through relationship (updated)',
          website: 'https://newsite-updated.com',
        })
        await existingProfile.save()
        newProfile = existingProfile
      }
    }

    // 4. Check if user has profile
    const userToCheck = await User.first()
    let hasProfile = false
    if (userToCheck) {
      const profileExists = await userToCheck.related('profile').query().first()
      hasProfile = !!profileExists
    }

    return {
      userWithProfile: userWithProfile?.toJSON(),
      userAfterLoad: user?.toJSON(),
      hasProfile,
    }
  }

  // ==============================================
  // @hasMany RELATIONSHIP OPERATIONS
  // ==============================================

  public async getHasManyExamples() {
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

    // 4. Create new post for user (check for duplicates)
    const userForNewPost = await User.first()
    let newPost: Post | null = null
    if (userForNewPost) {
      // Check if post with this slug already exists
      const existingPost = await Post.query().where('slug', 'new-post-via-relationship').first()
      if (!existingPost) {
        newPost = await userForNewPost.related('posts').create({
          title: 'New Post Created via Relationship',
          content: 'This post was created using the hasMany relationship',
          slug: 'new-post-via-relationship',
          isPublished: false,
        })
      } else {
        newPost = existingPost
      }
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

    return {
      userWithPosts: userWithPosts?.toJSON(),
      userWithPublishedPosts: userWithPublishedPosts?.toJSON(),
      postsCount: postsCount,
      newPost: newPost?.toJSON(),
      paginatedPosts: paginatedPosts?.toJSON(),
    }
  }

  // ==============================================
  // @belongsTo RELATIONSHIP OPERATIONS
  // ==============================================

  public async getBelongsToExamples() {
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
    let postAuthor: User | null = null
    if (post) {
      await post.load('user')
      postAuthor = post.user
    }

    // 4. Associate post with different user
    const postToUpdate = await Post.first()
    // Check if jane user already exists
    let newUser = await User.query().where('email', 'jane@example.com').first()
    if (!newUser) {
      newUser = await User.create({
        email: 'jane@example.com',
        username: 'jane_doe',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Doe',
      })
    }
    
    if (postToUpdate) {
      await postToUpdate.related('user').associate(newUser)
    }

    // 5. Query posts by user email (join through relationship)
    const postsByUserEmail = await Post.query()
      .preload('user')
      .whereHas('user', (userQuery) => {
        userQuery.where('email', 'john@example.com')
      })

    return {
      postWithAuthor: postWithAuthor?.toJSON(),
      profileWithUser: profileWithUser?.toJSON(),
      postAuthor: postAuthor?.toJSON(),
      postsByUserEmail: postsByUserEmail.map(p => p.toJSON()),
    }
  }

  // ==============================================
  // @manyToMany RELATIONSHIP OPERATIONS
  // ==============================================

  public async getManyToManyExamples() {
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

    // 4. Attach new tags to a post (check for duplicates)
    const post = await Post.first()
    // Check if JavaScript tag already exists
    let jsTag = await Tag.query().where('name', 'JavaScript').first()
    if (!jsTag) {
      jsTag = await Tag.create({
        name: 'JavaScript',
        color: '#F59E0B',
        description: 'JavaScript programming language'
      })
    }

    if (post) {
      await post.related('tags').attach({
        [jsTag.id]: { 
          sort_order: 4, 
          is_primary: false 
        }
      })
    }

    // 5. Sync tags (replace all existing with new ones)
    const postToSync = await Post.query().offset(1).first() // Get second post
    if (postToSync) {
      const existingTags = await Tag.query().limit(2)
      const tagIds = existingTags.reduce((acc, tag) => {
        acc[tag.id] = { sort_order: 1, is_primary: true }
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

    return {
      postWithTags: postWithTags?.toJSON(),
      postWithTagsAndPivot: postWithTagsAndPivot?.toJSON(),
      tagWithPosts: tagWithPosts?.toJSON(),
      postsWithAdonisTag: postsWithAdonisTag.map(p => p.toJSON()),
      postsWithPrimaryAdonisTag: postsWithPrimaryAdonisTag.map(p => p.toJSON()),
      tagsCount: tagsCount,
    }
  }

  // ==============================================
  // ADVANCED QUERY OPERATIONS
  // ==============================================

  public async getAdvancedQueryExamples() {
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

    return {
      userWithNestedData: userWithNestedData?.toJSON(),
      usersWithCounts: usersWithCounts.map(u => u.toJSON()),
      activeUsersWithPublishedPosts: activeUsersWithPublishedPosts.map(u => u.toJSON()),
      usersWithProfileOrPosts: usersWithProfileOrPosts.map(u => u.toJSON()),
      usersWithoutProfile: usersWithoutProfile.map(u => u.toJSON()),
      popularPostsWithAuthors,
      userPostStats,
    }
  }

  // ==============================================
  // CLEANUP OPERATIONS
  // ==============================================

  public async cleanupAllData() {
    // Delete in correct order to respect foreign key constraints
    await Database.from('post_tag').del()
    await Tag.query().del()
    await Post.query().del()
    await Profile.query().del()
    await User.query().del()
  }
}
