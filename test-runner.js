#!/usr/bin/env node

/**
 * Test Runner Script
 * Demonstrates how to run different types of tests
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Test Runner for Task API Assessment\n');

const commands = {
  'unit': 'npm run test:unit',
  'integration': 'npm run test:integration', 
  'all': 'npm run test:all',
  'unit-coverage': 'npm run test:unit:coverage',
  'integration-coverage': 'npm run test:integration:coverage',
  'all-coverage': 'npm run test:all:coverage'
};

function runCommand(command, description) {
  console.log(`\n📋 ${description}`);
  console.log(`Running: ${command}`);
  console.log('─'.repeat(50));
  
  try {
    execSync(command, { 
      stdio: 'inherit',
      cwd: path.resolve(__dirname)
    });
    console.log(`✅ ${description} completed successfully\n`);
  } catch (error) {
    console.error(`❌ ${description} failed\n`);
    process.exit(1);
  }
}

function showHelp() {
  console.log('Usage: node test-runner.js [command]');
  console.log('\nAvailable commands:');
  console.log('  unit              - Run unit tests only');
  console.log('  integration       - Run integration tests only');
  console.log('  all               - Run both unit and integration tests');
  console.log('  unit-coverage     - Run unit tests with coverage');
  console.log('  integration-coverage - Run integration tests with coverage');
  console.log('  all-coverage      - Run all tests with coverage');
  console.log('  help              - Show this help message');
}

function main() {
  const command = process.argv[2];
  
  if (!command || command === 'help') {
    showHelp();
    return;
  }
  
  if (!commands[command]) {
    console.error(`❌ Unknown command: ${command}`);
    showHelp();
    process.exit(1);
  }
  
  const descriptions = {
    'unit': 'Unit Tests (with mocks)',
    'integration': 'Integration Tests (real code)',
    'all': 'All Tests (unit + integration)',
    'unit-coverage': 'Unit Tests with Coverage Report',
    'integration-coverage': 'Integration Tests with Coverage Report',
    'all-coverage': 'All Tests with Coverage Report'
  };
  
  runCommand(commands[command], descriptions[command]);
}

main();
