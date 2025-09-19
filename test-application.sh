#!/bin/bash

echo "🚀 Testing Task Management Application"
echo "======================================"

# Test Backend API
echo "📡 Testing Backend API..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)
if [ "$BACKEND_STATUS" = "200" ]; then
    echo "✅ Backend API is running (http://localhost:3000)"
else
    echo "❌ Backend API is not responding"
    exit 1
fi

# Test Frontend
echo "🌐 Testing Frontend..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001)
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Frontend is running (http://localhost:3001)"
else
    echo "❌ Frontend is not responding"
    exit 1
fi

# Test Authentication
echo "🔐 Testing Authentication..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"testuser@example.com","password":"password123"}')

if echo "$REGISTER_RESPONSE" | grep -q "success.*true"; then
    echo "✅ User registration works"
    
    # Extract token for further testing
    TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.token')
    
    # Test Task Creation
    echo "📝 Testing Task Management..."
    TASK_RESPONSE=$(curl -s -X POST http://localhost:3000/api/tasks \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"title":"Test Task","description":"Testing task creation","priority":"medium"}')
    
    if echo "$TASK_RESPONSE" | grep -q "success.*true"; then
        echo "✅ Task creation works"
        
        # Test Task Retrieval
        TASKS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/tasks)
        if echo "$TASKS_RESPONSE" | grep -q "success.*true"; then
            echo "✅ Task retrieval works"
        else
            echo "❌ Task retrieval failed"
        fi
        
        # Test Statistics
        STATS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/tasks/stats)
        if echo "$STATS_RESPONSE" | grep -q "success.*true"; then
            echo "✅ Task statistics work"
        else
            echo "❌ Task statistics failed"
        fi
    else
        echo "❌ Task creation failed"
    fi
else
    echo "❌ User registration failed"
fi

echo ""
echo "🎉 Application Testing Complete!"
echo "================================"
echo "Frontend: http://localhost:3001"
echo "Backend API: http://localhost:3000"
echo ""
echo "You can now:"
echo "1. Open http://localhost:3001 in your browser"
echo "2. Register a new account"
echo "3. Login and start managing tasks"
echo "4. View task statistics on the dashboard"
