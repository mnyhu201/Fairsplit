import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.API_BASE || 'http://localhost:3000';
let authToken = "eyJhbGciOiJIUzI1NiIsImtpZCI6IlJXTlRTSHAwWGdSTGJ0YlAiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3JidmlqemN1Z21udndvb2d1cG51LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI3OTllMjljNC02OTExLTRiZjUtYjZiOC1mMjQwZTM2MmUzYzkiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzUxMDc1NDQxLCJpYXQiOjE3NTEwNzE4NDEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiNzk5ZTI5YzQtNjkxMS00YmY1LWI2YjgtZjI0MGUzNjJlM2M5In0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTEwNzE4NDF9XSwic2Vzc2lvbl9pZCI6IjgyMTg3NmMzLTY2ZWQtNDkwMC04MDg2LTc5ZGEzYWE2MDM4NCIsImlzX2Fub255bW91cyI6ZmFsc2V9.Y-D6qs0JAnzhUe7-3GEsdmevT9eP7_XVUMCHVsZKL4M";
let testGroupId = null;
let testUserId = null;

// Test data
const testGroup = {
    name: 'Test Group',
    is_active: true
};

const testUser = {
    username: 'testuser2',
    email: 'test@example.com',
    password: 'password!',
    fullname: 'Test User 2'
};

async function testGroups() {
    console.log('🧪 Testing Group Endpoints...\n');

    try {
        // // Step 1: Register a test user
        // console.log('1. Registering test user...');
        // const registerResponse = await axios.post(`${BASE_URL}/api/users/register`, testUser);
        // console.log('✅ User registered successfully');
        // testUserId = registerResponse.data.id;

        // // Step 2: Login to get auth token
        // console.log('2. Logging in...');
        // const loginResponse = await axios.post(`${BASE_URL}/api/users/login`, {
        //     email: testUser.email,
        //     password: testUser.password
        // });
        // authToken = loginResponse.data.token;
        // console.log('✅ Login successful');

        // Step 3: Create a group
        console.log('3. Creating a group...');
        const createGroupResponse = await axios.post(`${BASE_URL}/api/groups`, testGroup, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        testGroupId = createGroupResponse.data.id;
        console.log('✅ Group created successfully:', createGroupResponse.data);

        // Step 4: Get all groups
        console.log('4. Getting all groups...');
        const getAllGroupsResponse = await axios.get(`${BASE_URL}/api/groups`);
        console.log('✅ All groups retrieved:', getAllGroupsResponse.data.length, 'groups');

        // Step 5: Get group by ID
        console.log('5. Getting group by ID...');
        const getGroupResponse = await axios.get(`${BASE_URL}/api/groups/${testGroupId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ Group retrieved:', getGroupResponse.data);

        // Step 6: Get group with users
        console.log('6. Getting group with users...');
        const getGroupWithUsersResponse = await axios.get(`${BASE_URL}/api/groups/${testGroupId}/users`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ Group with users retrieved:', getGroupWithUsersResponse.data);

        // Step 7: Add user to group
        console.log('7. Adding user to group...');
        const addUserResponse = await axios.post(`${BASE_URL}/api/groups/${testGroupId}/users/${testUserId}`, {}, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ User added to group');

        // Step 8: Get my groups
        console.log('8. Getting my groups...');
        const getMyGroupsResponse = await axios.get(`${BASE_URL}/api/groups/my-groups`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ My groups retrieved:', getMyGroupsResponse.data.length, 'groups');

        // Step 9: Update group
        console.log('9. Updating group...');
        const updateData = { name: 'Updated Test Group' };
        const updateGroupResponse = await axios.put(`${BASE_URL}/api/groups/${testGroupId}`, updateData, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ Group updated:', updateGroupResponse.data);

        // Step 10: Get groups by active status
        console.log('10. Getting active groups...');
        const getActiveGroupsResponse = await axios.get(`${BASE_URL}/api/groups/active/true`);
        console.log('✅ Active groups retrieved:', getActiveGroupsResponse.data.length, 'groups');

        // Step 11: Remove user from group
        console.log('11. Removing user from group...');
        const removeUserResponse = await axios.delete(`${BASE_URL}/api/groups/${testGroupId}/users/${testUserId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ User removed from group');

        // Step 12: Delete group
        console.log('12. Deleting group...');
        await axios.delete(`${BASE_URL}/api/groups/${testGroupId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ Group deleted');

        console.log('\n🎉 All Group tests passed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        if (error.response?.status) {
            console.error('Status:', error.response.status);
        }
    }
}

// Run the tests
testGroups(); 