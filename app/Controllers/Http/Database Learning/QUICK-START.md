# Quick Start Guide for AdonisJS Relationships Learning

## 1. Add Routes to Your Application

Copy these routes to your `start/routes.ts` file:

```typescript
// Learning Routes for AdonisJS Relationships
Route.group(() => {
  Route.post('/setup', 'Database Learning/LearningController.createSampleData')
  Route.delete('/cleanup', 'Database Learning/LearningController.cleanupData')
  Route.get('/has-one', 'Database Learning/LearningController.hasOneExamples')
  Route.get('/has-many', 'Database Learning/LearningController.hasManyExamples')
  Route.get('/belongs-to', 'Database Learning/LearningController.belongsToExamples')
  Route.get('/many-to-many', 'Database Learning/LearningController.manyToManyExamples')
  Route.get('/advanced', 'Database Learning/LearningController.advancedQueries')
}).prefix('/api/learning')
```

## 2. Start Your Server

```bash
node ace serve --watch
```

## 3. Test the Relationships (using Postman, curl, or browser)

### Step 1: Create Sample Data
```
POST http://localhost:3333/api/learning/setup
```

### Step 2: Test Each Relationship Type
```
GET http://localhost:3333/api/learning/has-one
GET http://localhost:3333/api/learning/has-many
GET http://localhost:3333/api/learning/belongs-to
GET http://localhost:3333/api/learning/many-to-many
GET http://localhost:3333/api/learning/advanced
```

### Step 3: Clean Up When Done
```
DELETE http://localhost:3333/api/learning/cleanup
```

## What You'll Learn

- **@hasOne**: User has one Profile (one-to-one relationship)
- **@hasMany**: User has many Posts (one-to-many relationship)  
- **@belongsTo**: Post belongs to User, Profile belongs to User (inverse relationships)
- **@manyToMany**: Post has many Tags, Tag has many Posts (many-to-many relationship)

## Files Created

1. **LearningController.ts** - Contains all relationship examples with detailed comments
2. **RELATIONSHIPS-GUIDE.md** - Comprehensive guide explaining each relationship type
3. **learning-routes.ts** - Routes definition file (copy routes from here)
4. **QUICK-START.md** - This file with setup instructions

## Database Structure Created

- **Users** (id, email, username, password, first_name, last_name, is_active)
- **Profiles** (id, user_id[FK], bio, avatar_url, website, location, birth_date, phone_number)
- **Posts** (id, user_id[FK], title, content, slug, is_published, view_count)
- **Tags** (id, name, slug, color, description, posts_count)
- **Post_Tag** (pivot table: id, post_id[FK], tag_id[FK], sort_order, is_primary)

## Models Enhanced

All models now have proper relationships:
- User.ts - @hasOne profile, @hasMany posts
- Profile.ts - @belongsTo user
- Post.ts - @belongsTo user, @manyToMany tags
- Tag.ts - @manyToMany posts

Enjoy learning AdonisJS relationships! 🚀
