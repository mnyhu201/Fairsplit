#!/bin/bash

# Test script for registration and login using curl
# Make sure the server is running on localhost:3001

API_BASE="http://localhost:3001/api"
TEST_EMAIL="test@example.com"
TEST_PASSWORD="password123"
TEST_USERNAME="testuser"
TEST_FULLNAME="Test User"

echo "🚀 Starting Authentication Tests with curl..."

echo ""
echo "🧪 Testing User Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "${API_BASE}/users/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\",
    \"username\": \"${TEST_USERNAME}\",
    \"fullname\": \"${TEST_FULLNAME}\"
  }")

echo "Registration Response:"
echo "$REGISTER_RESPONSE" | jq '.' 2>/dev/null || echo "$REGISTER_RESPONSE"

echo ""
echo "🧪 Testing User Login..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE}/users/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\"
  }")

echo "Login Response:"
echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"

# Extract access token from login response
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$ACCESS_TOKEN" ]; then
  echo ""
  echo "🧪 Testing Get Current User (with token)..."
  CURRENT_USER_RESPONSE=$(curl -s -X GET "${API_BASE}/users/profile/me" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "Content-Type: application/json")
  
  echo "Current User Response:"
  echo "$CURRENT_USER_RESPONSE" | jq '.' 2>/dev/null || echo "$CURRENT_USER_RESPONSE"
else
  echo ""
  echo "⚠️  No access token found, skipping authenticated tests"
fi

echo ""
echo "🧪 Testing Get All Users (public endpoint)..."
ALL_USERS_RESPONSE=$(curl -s -X GET "${API_BASE}/users" \
  -H "Content-Type: application/json")

echo "All Users Response:"
echo "$ALL_USERS_RESPONSE" | jq '.' 2>/dev/null || echo "$ALL_USERS_RESPONSE"

echo ""
echo "🧪 Testing Get User by Username (public endpoint)..."
USER_BY_USERNAME_RESPONSE=$(curl -s -X GET "${API_BASE}/users/username/${TEST_USERNAME}" \
  -H "Content-Type: application/json")

echo "User by Username Response:"
echo "$USER_BY_USERNAME_RESPONSE" | jq '.' 2>/dev/null || echo "$USER_BY_USERNAME_RESPONSE"

echo ""
echo "🧪 Testing Health Check..."
HEALTH_RESPONSE=$(curl -s -X GET "http://localhost:3001/health")

echo "Health Check Response:"
echo "$HEALTH_RESPONSE" | jq '.' 2>/dev/null || echo "$HEALTH_RESPONSE"

echo ""
echo "✨ Tests completed!" 