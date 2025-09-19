#!/bin/bash

# Frontend Test Runner Script
# This script runs the frontend tests for the task creation and dashboard flow

echo "🧪 Running Frontend Tests for Task Creation and Dashboard Flow"
echo "=============================================================="

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the frontend directory"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "🔍 Running Task Creation and Dashboard Integration Tests..."
echo ""

# Run the specific integration test
npm run test:run src/test/task-dashboard-integration.test.tsx

echo ""
echo "🔍 Running Comprehensive Task Creation Flow Tests..."
echo ""

# Run the comprehensive test suite
npm run test:run src/test/task-creation-flow.test.tsx

echo ""
echo "✅ All tests completed!"
echo ""
echo "To run tests in watch mode: npm test"
echo "To run tests with UI: npm run test:ui"
