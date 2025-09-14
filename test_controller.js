const axios = require('axios');

async function testController() {
  try {
    console.log('Testing Learning Controller endpoints...\n');
    
    const baseURL = 'http://127.0.0.1:3333/api/v1/learning';
    
    // Test 1: Create sample data
    console.log('1. Creating sample data...');
    const createResponse = await axios.post(`${baseURL}/create-sample-data`);
    console.log('✅ Sample data created successfully');
    console.log('Sample user:', createResponse.data.data.user.email);
    console.log('Sample profile bio:', createResponse.data.data.profile.bio);
    console.log('Sample posts count:', createResponse.data.data.posts.length);
    console.log('Sample tags count:', createResponse.data.data.tags.length);
    console.log();
    
    // Test 2: hasOne examples
    console.log('2. Testing hasOne relationship examples...');
    const hasOneResponse = await axios.get(`${baseURL}/has-one-examples`);
    console.log('✅ hasOne examples worked');
    console.log();
    
    // Test 3: hasMany examples
    console.log('3. Testing hasMany relationship examples...');
    const hasManyResponse = await axios.get(`${baseURL}/has-many-examples`);
    console.log('✅ hasMany examples worked');
    console.log();
    
    // Test 4: belongsTo examples
    console.log('4. Testing belongsTo relationship examples...');
    const belongsToResponse = await axios.get(`${baseURL}/belongs-to-examples`);
    console.log('✅ belongsTo examples worked');
    console.log();
    
    // Test 5: manyToMany examples
    console.log('5. Testing manyToMany relationship examples...');
    const manyToManyResponse = await axios.get(`${baseURL}/many-to-many-examples`);
    console.log('✅ manyToMany examples worked');
    console.log();
    
    console.log('🎉 All tests passed! Learning Controller is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data?.details) {
      console.error('Details:', error.response.data.details);
    }
  }
}

testController();
