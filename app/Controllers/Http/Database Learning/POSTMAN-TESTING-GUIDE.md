# Database Relationships - Complete Postman Testing Guide

## 🚀 Setup & Prerequisites

### 1. Start Your AdonisJS Server
```bash
npm run dev
# Server should be running on http://localhost:3333
```

### 2. Postman Base URL
All requests use: `http://localhost:3333/api/v1/learning`

### 3. Headers for All Requests
- **Content-Type**: `application/json`
- **Accept**: `application/json`

---

## 🔗 ONE-TO-ONE RELATIONSHIPS (User ↔ Profile)

Each User has exactly one Profile. Each Profile belongs to exactly one User.

### 1. Create User with Profile
**POST** `http://localhost:3333/api/v1/learning/create-user-with-profile`

**JSON Body:**
```json
{
  "email": "john@example.com",
  "username": "johndoe",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Software developer from NYC",
  "avatarUrl": "https://example.com/avatar.jpg",
  "website": "https://johndoe.dev",
  "location": "New York, NY",
  "phoneNumber": "+1234567890"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User with profile created successfully using ONE-TO-ONE relationship",
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "username": "johndoe"
    },
    "profile": {
      "id": 1,
      "userId": 1,
      "bio": "Software developer from NYC"
    }
  },
  "relationshipType": "ONE-TO-ONE (User ↔ Profile)"
}
```

### 2. Get User with Profile
**GET** `http://localhost:3333/api/v1/learning/user/1/with-profile`

### 3. Update User Profile
**PUT** `http://localhost:3333/api/v1/learning/user/1/update-profile`

**JSON Body:**
```json
{
  "bio": "Updated bio - Full stack developer",
  "website": "https://newsite.com",
  "location": "San Francisco, CA"
}
```

---

## 📝 ONE-TO-MANY RELATIONSHIPS (User → Posts)

One User can have many Posts. Each Post belongs to one User (BELONGS-TO reverse).

### 1. Create Multiple Posts for User
**POST** `http://localhost:3333/api/v1/learning/user/1/create-posts`

**JSON Body:**
```json
{
  "posts": [
    {
      "title": "My First Blog Post",
      "content": "This is the content of my first post using ONE-TO-MANY relationship.",
      "slug": "my-first-blog-post",
      "isPublished": true,
      "viewCount": 0
    },
    {
      "title": "Learning AdonisJS Relationships",
      "content": "Understanding ONE-TO-MANY relationships in AdonisJS.",
      "slug": "learning-adonisjs-relationships",
      "isPublished": false,
      "viewCount": 0
    },
    {
      "title": "Database Design Best Practices",
      "content": "Tips for designing efficient database relationships.",
      "slug": "database-design-best-practices",
      "isPublished": true,
      "viewCount": 25
    }
  ]
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "3 posts created using ONE-TO-MANY relationship",
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe"
    },
    "posts": [
      {
        "id": 1,
        "title": "My First Blog Post",
        "userId": 1
      }
    ]
  },
  "relationshipType": "ONE-TO-MANY (User → Posts)"
}
```

### 2. Get User with All Posts
**GET** `http://localhost:3333/api/v1/learning/user/1/with-posts`

### 3. Get Post with User (BELONGS-TO)
**GET** `http://localhost:3333/api/v1/learning/post/1/with-user`

### 4. Get Published Posts by User
**GET** `http://localhost:3333/api/v1/learning/user/1/published-posts`

### 5. Get User Posts Statistics
**GET** `http://localhost:3333/api/v1/learning/user/1/posts-stats`

---

## 🏷️ MANY-TO-MANY RELATIONSHIPS (Posts ↔ Tags)

One Post can have many Tags. One Tag can be attached to many Posts. Uses pivot table with additional columns.

### First, Create Some Tags (using your existing models)
You'll need to create tags first. You can use the AdonisJS Tinker or create them directly:

```javascript
// In Tinker: node ace tinker
await Tag.create({ name: 'JavaScript', color: '#F0DB4F', description: 'JavaScript programming language' })
await Tag.create({ name: 'Node.js', color: '#339933', description: 'Node.js runtime' })
await Tag.create({ name: 'AdonisJS', color: '#220052', description: 'AdonisJS framework' })
await Tag.create({ name: 'Database', color: '#336791', description: 'Database related' })
await Tag.create({ name: 'Tutorial', color: '#FF6B6B', description: 'Tutorial content' })
```

### 1. Attach Tags to Post (Simple)
**POST** `http://localhost:3333/api/v1/learning/post/1/attach-tags`

**JSON Body:**
```json
{
  "tagIds": [1, 2, 3]
}
```

### 2. Attach Tags with Pivot Data
**POST** `http://localhost:3333/api/v1/learning/post/2/attach-tags`

**JSON Body:**
```json
{
  "tagIds": [1, 3, 4],
  "pivotData": {
    "sortOrder": 1,
    "isPrimary": true
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Tags attached to post using MANY-TO-MANY relationship",
  "data": {
    "post": {
      "id": 2,
      "title": "Learning AdonisJS Relationships",
      "tags": [
        {
          "id": 1,
          "name": "JavaScript",
          "$pivot": {
            "postId": 2,
            "tagId": 1,
            "sortOrder": 1,
            "isPrimary": true
          }
        }
      ]
    },
    "attachedTagsCount": 3
  },
  "relationshipType": "MANY-TO-MANY (Posts ↔ Tags) with pivot data"
}
```

### 3. Get Post with All Tags
**GET** `http://localhost:3333/api/v1/learning/post/1/with-tags`

### 4. Get Tag with All Posts
**GET** `http://localhost:3333/api/v1/learning/tag/1/with-posts`

### 5. Sync Tags (Replace All Existing)
**PUT** `http://localhost:3333/api/v1/learning/post/1/sync-tags`

**JSON Body:**
```json
{
  "tagIds": [2, 4, 5],
  "pivotData": {
    "sortOrder": 1,
    "isPrimary": false
  }
}
```

### 6. Detach Specific Tags
**DELETE** `http://localhost:3333/api/v1/learning/post/1/detach-tags`

**JSON Body:**
```json
{
  "tagIds": [2, 3]
}
```

### 7. Detach All Tags
**DELETE** `http://localhost:3333/api/v1/learning/post/1/detach-tags`
*(No JSON body - will detach all tags)*

---

## 🔍 ADVANCED RELATIONSHIP QUERIES

### 1. Get Posts by Specific Tag
**GET** `http://localhost:3333/api/v1/learning/posts-by-tag/1`

### 2. Get Posts with ALL Specified Tags
**POST** `http://localhost:3333/api/v1/learning/posts-with-all-tags`

**JSON Body:**
```json
{
  "tagIds": [1, 3]
}
```

### 3. Get Popular Tags (Most Used)
**GET** `http://localhost:3333/api/v1/learning/popular-tags?limit=5`

---

## 🧹 CLEANUP & UTILITY

### Clean All Data
**DELETE** `http://localhost:3333/api/v1/learning/cleanup-all`

**Expected Response:**
```json
{
  "success": true,
  "message": "All relationship data cleaned up in correct order",
  "data": {
    "message": "All relationship data cleaned up successfully",
    "deletedRelationships": [
      "MANY-TO-MANY (post_tag)",
      "ONE-TO-MANY (user→posts)",
      "ONE-TO-ONE (user↔profile)"
    ]
  },
  "relationshipType": "ALL (demonstrates proper cleanup order for relationships)"
}
```

---

## 🧪 COMPLETE TESTING SEQUENCE

### Step 1: Setup Data
1. **Create User with Profile** (ONE-TO-ONE)
2. **Create Posts for User** (ONE-TO-MANY)
3. **Create Tags** (manually or via Tinker)

### Step 2: Test ONE-TO-ONE Relationships
1. Create user with profile
2. Get user with profile
3. Update profile through user

### Step 3: Test ONE-TO-MANY Relationships
1. Create multiple posts for user
2. Get user with all posts
3. Get post with its user (BELONGS-TO)
4. Get only published posts
5. Get user posts statistics

### Step 4: Test MANY-TO-MANY Relationships
1. Attach tags to posts (simple)
2. Attach tags with pivot data
3. Get post with tags
4. Get tag with posts
5. Sync tags (replace existing)
6. Detach specific tags
7. Get posts by tag
8. Get posts with multiple tags
9. Get popular tags

### Step 5: Test Advanced Queries
1. Filter posts by tag
2. Find posts with ALL specified tags
3. Get aggregated statistics

### Step 6: Cleanup
1. Clean all data in proper order

---

## 📋 POSTMAN COLLECTION SETUP

### Create Postman Environment
**Environment Name:** `AdonisJS Learning`

**Variables:**
- `base_url`: `http://localhost:3333`
- `api_prefix`: `/api/v1/learning`
- `user_id`: `1` (will be set after creating user)
- `post_id`: `1` (will be set after creating posts)
- `tag_id`: `1` (will be set after creating tags)

### Collection Structure
```
📁 Database Relationships Learning
├── 📁 ONE-TO-ONE (User ↔ Profile)
│   ├── POST Create User with Profile
│   ├── GET Get User with Profile
│   └── PUT Update User Profile
├── 📁 ONE-TO-MANY (User → Posts)
│   ├── POST Create Posts for User
│   ├── GET Get User with Posts
│   ├── GET Get Post with User
│   ├── GET Get Published Posts
│   └── GET Get User Stats
├── 📁 MANY-TO-MANY (Posts ↔ Tags)
│   ├── POST Attach Tags (Simple)
│   ├── POST Attach Tags (with Pivot)
│   ├── GET Get Post with Tags
│   ├── GET Get Tag with Posts
│   ├── PUT Sync Tags
│   ├── DELETE Detach Specific Tags
│   └── DELETE Detach All Tags
├── 📁 Advanced Queries
│   ├── GET Posts by Tag
│   ├── POST Posts with All Tags
│   └── GET Popular Tags
└── 📁 Utilities
    └── DELETE Cleanup All
```

---

## ⚡ QUICK TEST COMMANDS

### Using cURL (Alternative to Postman)

**Create User with Profile:**
```bash
curl -X POST http://localhost:3333/api/v1/learning/create-user-with-profile \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "bio": "Test bio"
  }'
```

**Create Posts:**
```bash
curl -X POST http://localhost:3333/api/v1/learning/user/1/create-posts \
  -H "Content-Type: application/json" \
  -d '{
    "posts": [
      {
        "title": "Test Post",
        "content": "Test content",
        "slug": "test-post",
        "isPublished": true
      }
    ]
  }'
```

---

## 🎯 TESTING TIPS

1. **Test in Order**: Always create users before posts, posts before attaching tags
2. **Check Response Types**: Each response includes `relationshipType` to show what relationship is demonstrated
3. **Verify Data**: Use GET requests to verify that relationships are properly created
4. **Test Edge Cases**: Try invalid IDs, empty arrays, missing data
5. **Monitor Console**: Check your AdonisJS server console for any errors
6. **Use Variables**: In Postman, use environment variables for dynamic IDs

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue: "User not found"
**Solution:** Make sure you created a user first and are using the correct user ID

### Issue: "Post not found" 
**Solution:** Create posts for the user before trying to attach tags

### Issue: "Tag not found"
**Solution:** Create tags first using Tinker or direct model creation

### Issue: Database errors
**Solution:** Check your database connection and run migrations

### Issue: Route not found
**Solution:** Make sure you've imported the routes file in your main routes file

---

This comprehensive guide covers all relationship types and testing scenarios! 🚀