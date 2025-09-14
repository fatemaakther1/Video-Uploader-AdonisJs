# AdonisJS Relationships Learning Guide

This guide covers all four main relationship types in AdonisJS: `@hasOne`, `@hasMany`, `@belongsTo`, and `@manyToMany`.

## Table of Contents
1. [Database Structure](#database-structure)
2. [Model Relationships](#model-relationships)
3. [Relationship Types](#relationship-types)
4. [Query Examples](#query-examples)
5. [Testing Instructions](#testing-instructions)

## Database Structure

We've created four tables to demonstrate relationships:

### 1. Users Table
```sql
- id (primary key)
- email (unique)
- username (unique)
- password
- first_name
- last_name
- is_active
- created_at, updated_at
```

### 2. Profiles Table
```sql
- id (primary key)
- user_id (foreign key → users.id) [UNIQUE for one-to-one]
- bio
- avatar_url
- website
- location
- birth_date
- phone_number
- created_at, updated_at
```

### 3. Posts Table
```sql
- id (primary key)
- user_id (foreign key → users.id)
- title
- content
- slug (unique)
- is_published
- view_count
- created_at, updated_at
```

### 4. Tags Table
```sql
- id (primary key)
- name (unique)
- slug (unique)
- color
- description
- posts_count
- created_at, updated_at
```

### 5. Post_Tag Pivot Table (for many-to-many)
```sql
- id (primary key)
- post_id (foreign key → posts.id)
- tag_id (foreign key → tags.id)
- sort_order
- is_primary
- created_at, updated_at
- unique constraint on [post_id, tag_id]
```

## Model Relationships

### User Model (@hasOne, @hasMany)
```typescript
export default class User extends BaseModel {
  // @hasOne relationship - User has one Profile
  @hasOne(() => Profile, {
    foreignKey: 'userId', // Column in profiles table
  })
  public profile: HasOne<typeof Profile>

  // @hasMany relationship - User has many Posts
  @hasMany(() => Post, {
    foreignKey: 'userId', // Column in posts table
  })
  public posts: HasMany<typeof Post>
}
```

### Profile Model (@belongsTo)
```typescript
export default class Profile extends BaseModel {
  // @belongsTo relationship - Profile belongs to one User
  @belongsTo(() => User, {
    foreignKey: 'userId', // Column in this table (profiles)
  })
  public user: BelongsTo<typeof User>
}
```

### Post Model (@belongsTo, @manyToMany)
```typescript
export default class Post extends BaseModel {
  // @belongsTo relationship - Post belongs to one User
  @belongsTo(() => User, {
    foreignKey: 'userId', // Column in this table (posts)
  })
  public user: BelongsTo<typeof User>

  // @manyToMany relationship - Post has many Tags
  @manyToMany(() => Tag, {
    pivotTable: 'post_tag',
    localKey: 'id',
    pivotForeignKey: 'post_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'tag_id',
    pivotColumns: ['sort_order', 'is_primary'],
    pivotTimestamps: true,
  })
  public tags: ManyToMany<typeof Tag>
}
```

### Tag Model (@manyToMany)
```typescript
export default class Tag extends BaseModel {
  // @manyToMany relationship - Tag has many Posts
  @manyToMany(() => Post, {
    pivotTable: 'post_tag',
    localKey: 'id',
    pivotForeignKey: 'tag_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'post_id',
    pivotColumns: ['sort_order', 'is_primary'],
    pivotTimestamps: true,
  })
  public posts: ManyToMany<typeof Post>
}
```

## Relationship Types

### 1. @hasOne (One-to-One)
**Use Case**: User has one Profile

```typescript
// Load user with profile (eager loading)
const userWithProfile = await User.query().preload('profile').first()

// Load profile through relationship (lazy loading)
const user = await User.first()
if (user) {
  await user.load('profile')
  // Or: const profile = await user.related('profile').query().first()
}

// Create profile for user
const newProfile = await user.related('profile').create({
  bio: 'New bio',
  website: 'https://example.com'
})

// Check if user has profile
const hasProfile = !!(await user.related('profile').query().first())
```

### 2. @hasMany (One-to-Many)
**Use Case**: User has many Posts

```typescript
// Load user with all posts
const userWithPosts = await User.query().preload('posts').first()

// Load user with filtered posts
const userWithPublishedPosts = await User.query()
  .preload('posts', (postsQuery) => {
    postsQuery.where('is_published', true)
    postsQuery.orderBy('view_count', 'desc')
  })
  .first()

// Count posts for user
const postsCount = await user.related('posts').query().count('* as total')

// Create new post for user
const newPost = await user.related('posts').create({
  title: 'New Post',
  content: 'Post content',
  slug: 'new-post'
})

// Paginate user's posts
const paginatedPosts = await user
  .related('posts')
  .query()
  .paginate(1, 10)
```

### 3. @belongsTo (Inverse Relationship)
**Use Case**: Post belongs to User, Profile belongs to User

```typescript
// Load post with its author
const postWithAuthor = await Post.query().preload('user').first()

// Load user through post (lazy loading)
const post = await Post.first()
if (post) {
  await post.load('user')
  // Or: const author = await post.related('user').query().first()
}

// Associate post with different user
await post.related('user').associate(newUser)

// Query posts by user characteristics
const postsByActiveUsers = await Post.query()
  .whereHas('user', (userQuery) => {
    userQuery.where('is_active', true)
  })
```

### 4. @manyToMany (Many-to-Many)
**Use Case**: Post has many Tags, Tag has many Posts

```typescript
// Load post with tags
const postWithTags = await Post.query().preload('tags').first()

// Load with pivot data
const postWithTagsAndPivot = await Post.query()
  .preload('tags', (tagsQuery) => {
    tagsQuery.pivotColumns(['sort_order', 'is_primary'])
  })
  .first()

// Attach tags to post
await post.related('tags').attach({
  [tagId1]: { sortOrder: 1, isPrimary: true },
  [tagId2]: { sortOrder: 2, isPrimary: false }
})

// Sync tags (replace all existing)
await post.related('tags').sync({
  [tagId1]: { sortOrder: 1, isPrimary: true }
})

// Detach specific tags
await post.related('tags').detach([tagId1, tagId2])

// Query posts with specific tags
const postsWithAdonisTag = await Post.query()
  .whereHas('tags', (tagsQuery) => {
    tagsQuery.where('name', 'AdonisJS')
  })

// Query with pivot conditions
const postsWithPrimaryTag = await Post.query()
  .whereHas('tags', (tagsQuery) => {
    tagsQuery.where('name', 'AdonisJS')
    tagsQuery.wherePivot('is_primary', true)
  })
```

## Advanced Query Examples

### Nested Relationships
```typescript
// Load user with profile and posts with tags
const userWithNestedData = await User.query()
  .preload('profile')
  .preload('posts', (postsQuery) => {
    postsQuery.preload('tags')
    postsQuery.where('is_published', true)
  })
  .first()
```

### Counting Related Records
```typescript
// Count related records
const usersWithCounts = await User.query()
  .withCount('posts')
  .withCount('posts', (query) => {
    query.where('is_published', true)
  })
```

### Complex WHERE Conditions
```typescript
// Users who have profiles OR posts
const usersWithProfileOrPosts = await User.query()
  .whereHas('profile')
  .orWhereHas('posts')

// Users without profiles
const usersWithoutProfile = await User.query()
  .doesntHave('profile')

// Active users with popular posts
const activeUsersWithPopularPosts = await User.query()
  .where('is_active', true)
  .whereHas('posts', (postsQuery) => {
    postsQuery.where('is_published', true)
    postsQuery.where('view_count', '>', 100)
  })
```

### Raw Queries with Joins
```typescript
// Raw query with relationships
const popularPostsWithAuthors = await Database
  .from('posts')
  .join('users', 'posts.user_id', 'users.id')
  .where('posts.view_count', '>', 50)
  .select('posts.title', 'posts.view_count', 'users.username')
```

### Aggregate Functions
```typescript
// User post statistics
const userPostStats = await User.query()
  .join('posts', 'users.id', 'posts.user_id')
  .groupBy('users.id', 'users.username')
  .select('users.id', 'users.username')
  .count('posts.id as posts_count')
  .sum('posts.view_count as total_views')
  .avg('posts.view_count as avg_views')
```

## Testing Instructions

### 1. Setup Sample Data
```bash
# Create sample data
POST http://localhost:3333/api/learning/setup
```

### 2. Test Each Relationship Type
```bash
# Test @hasOne examples
GET http://localhost:3333/api/learning/has-one

# Test @hasMany examples
GET http://localhost:3333/api/learning/has-many

# Test @belongsTo examples
GET http://localhost:3333/api/learning/belongs-to

# Test @manyToMany examples
GET http://localhost:3333/api/learning/many-to-many

# Test advanced queries
GET http://localhost:3333/api/learning/advanced
```

### 3. Cleanup When Done
```bash
# Remove all test data
DELETE http://localhost:3333/api/learning/cleanup
```

## Key Points to Remember

1. **Foreign Keys**: Always define foreign key columns in your migrations
2. **Eager vs Lazy Loading**: Use `preload()` for eager loading, `load()` for lazy loading
3. **Pivot Tables**: Many-to-many relationships require pivot tables
4. **Cascade Deletes**: Use `onDelete('CASCADE')` in migrations for automatic cleanup
5. **Unique Constraints**: One-to-one relationships should have unique foreign keys
6. **Performance**: Use `withCount()` for counting instead of loading all related records

## Common Patterns

### Creating Records with Relationships
```typescript
// Create user with profile in one transaction
const user = await User.create(userData)
const profile = await user.related('profile').create(profileData)

// Create post with tags
const post = await user.related('posts').create(postData)
await post.related('tags').attach(tagIds)
```

### Querying with Filters
```typescript
// Load only published posts
const user = await User.query()
  .preload('posts', (query) => {
    query.where('is_published', true)
  })
  .first()

// Load posts with specific tags
const posts = await Post.query()
  .preload('tags')
  .whereHas('tags', (query) => {
    query.whereIn('name', ['AdonisJS', 'Tutorial'])
  })
```

This guide provides a comprehensive overview of AdonisJS relationships. Use the provided controller and routes to experiment with these patterns!
