#!/usr/bin/env node

import http from 'http';

const HARDHAT_RPC_URL = 'http://127.0.0.1:8545';

console.log('🔍 Checking if Hardhat node is running...\n');

const checkNode = () => {
  const postData = JSON.stringify({
    jsonrpc: '2.0',
    method: 'eth_blockNumber',
    params: [],
    id: 1,
  });

  const options = {
    hostname: '127.0.0.1',
    port: 8545,
    path: '/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
    timeout: 2000,
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.result) {
            resolve(true);
          } else {
            reject(new Error('Invalid response'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.write(postData);
    req.end();
  });
};

checkNode()
  .then(() => {
    console.log('✓ Hardhat node is running at', HARDHAT_RPC_URL);
    console.log('✓ Proceeding with dev:mock mode...\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('✗ Hardhat node is NOT running!');
    console.error('  Error:', error.message);
    console.error('\n📌 Please start Hardhat node first:');
    console.error('   cd ../fhevm-hardhat-template && npm run localfhevm\n');
    process.exit(1);
  });

