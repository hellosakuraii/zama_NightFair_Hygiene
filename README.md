# NightFair Hygiene

A privacy-preserving hygiene rating system for night markets built with FHEVM (Fully Homomorphic Encryption Virtual Machine). This project enables citizens to provide encrypted feedback on vendor hygiene while maintaining complete privacy of individual ratings.

## 🌟 Features

- **Privacy-Preserving Ratings**: All ratings are encrypted using FHEVM, ensuring individual feedback remains private
- **Homomorphic Aggregation**: Ratings are aggregated on-chain without decryption
- **Vendor Management**: Register and manage night market vendors
- **Authority Portal**: Special access for health authorities to view aggregated scores
- **Blacklist Management**: Authority can blacklist vendors based on poor hygiene scores
- **Public Directory**: View vendor hygiene scores without exposing individual ratings
- **Wallet Integration**: Seamless MetaMask and EIP-6963 wallet support

## 🏗️ Project Structure

```
zama_NightFair_Hygiene/
├── fhevm-hardhat-template/    # Smart contracts (Hardhat)
│   ├── contracts/             # Solidity contracts
│   │   ├── NightFairHygiene.sol  # Main contract
│   │   └── FHECounter.sol        # Example counter contract
│   ├── deploy/                 # Deployment scripts
│   ├── test/                   # Contract tests
│   └── tasks/                  # Hardhat tasks
│
└── nightfair-hygiene-frontend/ # Frontend (Next.js)
    ├── app/                    # Next.js app router pages
    │   ├── page.tsx           # Home page
    │   ├── register-vendor/   # Vendor registration
    │   ├── rate/              # Rating interface
    │   ├── scores/            # Public directory
    │   └── authority/         # Authority portal
    ├── components/            # React components
    ├── fhevm/                 # FHEVM integration
    ├── hooks/                 # React hooks
    └── abi/                   # Generated contract ABIs
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20
- npm >= 7.0.0
- MetaMask or compatible Web3 wallet

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hellosakuraii/zama_NightFair_Hygiene.git
   cd zama_NightFair_Hygiene
   ```

2. **Install contract dependencies**
   ```bash
   cd fhevm-hardhat-template
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../nightfair-hygiene-frontend
   npm install
   ```

### Development

#### Smart Contracts

1. **Start local Hardhat node**
   ```bash
   cd fhevm-hardhat-template
   npx hardhat node
   ```

2. **Compile contracts**
   ```bash
   npx hardhat compile
   ```

3. **Run tests**
   ```bash
   npx hardhat test
   ```

4. **Deploy to local network**
   ```bash
   npx hardhat deploy --network localhost
   ```

#### Frontend

1. **Generate ABI and addresses**
   ```bash
   cd nightfair-hygiene-frontend
   npm run genabi
   ```

2. **Run in mock mode** (for local development with Hardhat)
   ```bash
   npm run dev:mock
   ```
   This will:
   - Check if Hardhat node is running
   - Generate ABI and address mappings
   - Start dev server with mock FHEVM utils

3. **Run in production mode** (with real Relayer SDK)
   ```bash
   npm run dev
   ```
   This uses the real Zama Relayer SDK for encrypted operations.

4. **Build for production**
   ```bash
   npm run build
   ```
   The static export will be in the `out/` directory.

## 🔐 How It Works

### Encryption Flow

1. **User Rates Vendor**: User selects a hygiene rating (1-10)
2. **Encryption**: Rating is encrypted using FHEVM before submission
3. **On-Chain Storage**: Encrypted rating is stored on-chain
4. **Homomorphic Aggregation**: Contract aggregates ratings without decryption
5. **Decryption**: Only authorized users can decrypt aggregated results

### Key Components

- **NightFairHygiene Contract**: Main smart contract handling vendor registration, encrypted ratings, and score aggregation
- **FHEVM Integration**: Uses `@fhevm/solidity` for encrypted operations
- **Relayer SDK**: Handles encryption/decryption operations via Zama's relayer network
- **Mock Utils**: Local development support with `@fhevm/mock-utils`

## 📝 Usage

### Register a Vendor

1. Navigate to "Register Vendor"
2. Enter vendor name and location
3. Submit transaction (requires wallet connection)

### Rate a Vendor

1. Navigate to "Rate Vendor"
2. Select a vendor from the list
3. Choose a hygiene rating (1-10)
4. Submit encrypted rating

### View Scores

- **Public Directory**: View aggregated hygiene scores for all vendors
- **Authority Portal**: Special access for authorities to view detailed statistics and manage blacklist

## 🧪 Testing

### Contract Tests

```bash
cd fhevm-hardhat-template
npx hardhat test
```

### Test on Sepolia

```bash
npx hardhat test --network sepolia
```

## 🔧 Configuration

### Network Configuration

Contract addresses are automatically generated in `nightfair-hygiene-frontend/abi/NightFairHygieneAddresses.ts` after deployment.

### Environment Variables

No environment variables required for basic operation. The frontend automatically detects:
- Local Hardhat node (chainId: 31337) → uses mock utils
- Sepolia or other networks → uses real Relayer SDK

## 📦 Dependencies

### Smart Contracts
- `@fhevm/solidity`: ^0.9.1
- `@fhevm/hardhat-plugin`: ^0.3.0-1
- `hardhat`: ^2.26.0
- `ethers`: ^6.15.0

### Frontend
- `next`: ^15.0.0
- `react`: ^19.0.0
- `@zama-fhe/relayer-sdk`: ^0.3.0-5
- `@fhevm/mock-utils`: ^0.3.0-1 (dev)
- `ethers`: ^6.13.0

## 🌐 Supported Networks

- **Localhost** (Hardhat): Chain ID 31337
- **Sepolia Testnet**: Chain ID 11155111

## 🔒 Security

- All ratings are encrypted using FHEVM before submission
- Individual ratings cannot be decrypted by anyone except the rater
- Aggregated scores are computed homomorphically
- Authority access is controlled by smart contract permissions

## 📄 License

This project is licensed under the BSD-3-Clause-Clear License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 👥 Contributors

- [hellosakuraii](https://github.com/hellosakuraii)
- [Gladys-Laurie](https://github.com/Gladys-Laurie)

## 🔗 Links

- [Zama FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Next.js Documentation](https://nextjs.org/docs)

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

Built with ❤️ using [Zama FHEVM](https://www.zama.ai/)

