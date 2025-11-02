#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_DIR = path.join(__dirname, '..', 'app');
const PAGES_DIR = path.join(__dirname, '..', 'pages');

const errors = [];
const warnings = [];

console.log('🔍 Checking for static export violations...\n');

// Forbidden patterns
const FORBIDDEN_PATTERNS = [
  { pattern: /getServerSideProps/, message: 'getServerSideProps is not allowed in static export' },
  { pattern: /\bexport\s+const\s+revalidate\s*=/, message: 'ISR (revalidate) is not allowed in static export' },
  { pattern: /\bexport\s+const\s+runtime\s*=\s*['"]edge['"]/, message: 'Edge runtime is not allowed in static export' },
  { pattern: /from\s+['"]next\/headers['"]/, message: 'next/headers is not allowed in static export (use client-side only)' },
  { pattern: /\bcookies\s*\(/, message: 'cookies() is not allowed in static export' },
  { pattern: /\bheaders\s*\(/, message: 'headers() is not allowed in static export' },
  { pattern: /from\s+['"]server-only['"]/, message: 'server-only imports are not allowed in static export' },
  { pattern: /['"]use server['"]/, message: 'Server actions are not allowed in static export' },
];

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(path.join(__dirname, '..'), filePath);

  FORBIDDEN_PATTERNS.forEach(({ pattern, message }) => {
    if (pattern.test(content)) {
      errors.push(`${relativePath}: ${message}`);
    }
  });

  // Check for dynamic segments without generateStaticParams
  if (filePath.includes('[') && filePath.includes(']') && filePath.endsWith('.tsx')) {
    const dirPath = path.dirname(filePath);
    const hasGenerateStaticParams = content.includes('generateStaticParams');
    
    if (!hasGenerateStaticParams) {
      warnings.push(
        `${relativePath}: Dynamic route without generateStaticParams - this may cause build issues`
      );
    }
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules, .next, out
      if (!['node_modules', '.next', 'out'].includes(file)) {
        walkDir(filePath);
      }
    } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
      checkFile(filePath);
    }
  });
}

// Check app directory
if (fs.existsSync(APP_DIR)) {
  walkDir(APP_DIR);
}

// Check pages directory (if using pages router)
if (fs.existsSync(PAGES_DIR)) {
  walkDir(PAGES_DIR);
  
  // Check for API routes
  const apiDir = path.join(PAGES_DIR, 'api');
  if (fs.existsSync(apiDir)) {
    errors.push('pages/api directory found - API routes are not allowed in static export');
  }
}

// Check for app/api directory
const appApiDir = path.join(APP_DIR, 'api');
if (fs.existsSync(appApiDir)) {
  errors.push('app/api directory found - API routes are not allowed in static export');
}

// Report results
console.log('📊 Static Export Check Results:\n');

if (errors.length > 0) {
  console.error('❌ ERRORS FOUND:\n');
  errors.forEach((error) => {
    console.error(`  ✗ ${error}`);
  });
  console.error('');
}

if (warnings.length > 0) {
  console.warn('⚠️  WARNINGS:\n');
  warnings.forEach((warning) => {
    console.warn(`  ⚠ ${warning}`);
  });
  console.warn('');
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ No static export violations found!\n');
  process.exit(0);
} else if (errors.length > 0) {
  console.error('❌ Static export check failed. Please fix the errors above.\n');
  process.exit(1);
} else {
  console.log('✅ No errors, but please review warnings.\n');
  process.exit(0);
}

