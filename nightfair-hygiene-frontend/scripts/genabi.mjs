#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRONTEND_DIR = path.join(__dirname, '..');
const HARDHAT_DIR = path.join(FRONTEND_DIR, '..', 'fhevm-hardhat-template');
const DEPLOYMENTS_DIR = path.join(HARDHAT_DIR, 'deployments', 'localhost');
const OUTPUT_DIR = path.join(FRONTEND_DIR, 'abi');

console.log('🔍 Generating ABI files...\n');

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Check if deployments exist
if (!fs.existsSync(DEPLOYMENTS_DIR)) {
  console.warn(`⚠️  Deployments directory not found: ${DEPLOYMENTS_DIR}`);
  console.warn('   Please deploy contracts first using: npm run deploy:local\n');
  
  // Create placeholder files
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'NightFairHygieneABI.ts'),
    `export const NightFairHygieneABI = [] as const;\n`
  );
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'NightFairHygieneAddresses.ts'),
    `export const NightFairHygieneAddresses: Record<number, string> = {};\n`
  );
  
  console.log('✓ Created placeholder ABI files\n');
  process.exit(0);
}

// Read deployment file
const deploymentFile = path.join(DEPLOYMENTS_DIR, 'NightFairHygiene.json');

if (!fs.existsSync(deploymentFile)) {
  console.warn(`⚠️  NightFairHygiene deployment not found: ${deploymentFile}`);
  console.warn('   Creating placeholder files...\n');
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'NightFairHygieneABI.ts'),
    `export const NightFairHygieneABI = [] as const;\n`
  );
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'NightFairHygieneAddresses.ts'),
    `export const NightFairHygieneAddresses: Record<number, string> = {};\n`
  );
  
  console.log('✓ Created placeholder ABI files\n');
  process.exit(0);
}

const deployment = JSON.parse(fs.readFileSync(deploymentFile, 'utf-8'));

// Generate ABI file
const abiContent = `export const NightFairHygieneABI = ${JSON.stringify(deployment.abi, null, 2)} as const;\n`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'NightFairHygieneABI.ts'), abiContent);
console.log('✓ Generated NightFairHygieneABI.ts');

// Generate addresses file
const addressesContent = `export const NightFairHygieneAddresses: Record<number, string> = {
  31337: "${deployment.address}", // Localhost
  // Add Sepolia address after deployment: sepolia: "0x..."
};\n`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'NightFairHygieneAddresses.ts'), addressesContent);
console.log('✓ Generated NightFairHygieneAddresses.ts');

console.log(`\n✨ ABI generation complete! Files saved to ${OUTPUT_DIR}\n`);

