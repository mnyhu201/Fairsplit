// Simple test script for registration and login
// Run with: node test-auth.js

import dotenv from 'dotenv';

dotenv.config();

const API_BASE = process.env.API_BASE || 'http://localhost:3000/api';

// Test data
const testUser = {
  email: "minyu1128@icloud.com",
  password: "password",
};

// async function testRegistration() {
//   console.log('🧪 Testing User Registration...');
  
//   try {
//     const response = await fetch(`${API_BASE}/users/register`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify(testUser)
//     });

//     const data = await response.json();
    
//     if (response.ok) {
//       console.log('✅ Registration successful!');
//       console.log('User:', data.user);
//       console.log('Session:', data.session ? 'Available' : 'None');
//       return data.session?.access_token;
//     } else {
//       console.log('❌ Registration failed:', data.error);
//       return null;
//     }
//   } catch (error) {
//     console.log('❌ Registration error:', error.message);
//     return null;
//   }
// }

async function testLogin() {
  console.log('\n🧪 Testing User Login...');
  
  try {
    const response = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('User:', data.user);
      console.log('Session:', data.session ? 'Available' : 'None');
      return data.session?.access_token;
    } else {
      console.log('❌ Login failed:', data.error);
      return null;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return null;
  }
}

async function testGetCurrentUser(token) {
  if (!token) {
    console.log('\n⏭️  Skipping current user test (no token)');
    return;
  }

  console.log('\n🧪 Testing Get Current User...');
  
  try {
    const response = await fetch(`${API_BASE}/users/profile/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Get current user successful!');
      console.log('User:', data);
    } else {
      console.log('❌ Get current user failed:', data.error);
    }
  } catch (error) {
    console.log('❌ Get current user error:', error.message);
  }
}

async function testGetAllUsers() {
  console.log('\n🧪 Testing Get All Users...');
  
  try {
    const response = await fetch(`${API_BASE}/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Get all users successful!');
      console.log('Users count:', data.length);
      console.log('First user:', data[0]);
    } else {
      console.log('❌ Get all users failed:', data.error);
    }
  } catch (error) {
    console.log('❌ Get all users error:', error.message);
  }
}

async function testGetUserByUsername(token) {
  console.log('\n🧪 Testing Get User by Username...');
  
  try {
    const response = await fetch(`${API_BASE}/users/username/${testUser.username}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Get user by username successful!');
      console.log('User:', data);
    } else {
      console.log(data)
      console.log('❌ Get user by username failed:', data.error);
    }
  } catch (error) {
    console.log('❌ Get user by username error:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting Authentication Tests...\n');
  
  // Test registration
  // const token = await testRegistration();
  const token = "eyJhbGciOiJIUzI1NiIsImtpZCI6IlJXTlRTSHAwWGdSTGJ0YlAiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3JidmlqemN1Z21udndvb2d1cG51LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJhODZmYjgwYy02MWFjLTQzZmUtYjQzMC0xNTFmZDE5ZWViNDUiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzUxMDcwNzM5LCJpYXQiOjE3NTEwNjcxMzksImVtYWlsIjoibWlueXUxMTI4QGljbG91ZC5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsIjoibWlueXUxMTI4QGljbG91ZC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGhvbmVfdmVyaWZpZWQiOmZhbHNlLCJzdWIiOiJhODZmYjgwYy02MWFjLTQzZmUtYjQzMC0xNTFmZDE5ZWViNDUifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc1MTA2NzEzOX1dLCJzZXNzaW9uX2lkIjoiMzhkMzgxMTAtNzdiOC00OTVmLTk4NDktMDAyMzk3MjhlOWY3IiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.QpaJF_tSFH76L8Qx_k3otS6_Sct3rHARlGxSQ_vs1p8"
  
  // Test login
  const loginToken = await testLogin();
  
  // Test get current user with token
  await testGetCurrentUser(loginToken || token);
  
  // Test public endpoints
  await testGetAllUsers();
  await testGetUserByUsername(token);
  
  console.log('\n✨ Tests completed!');
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests }; 