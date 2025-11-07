# SliqPay Smart Contracts

This directory contains the blockchain smart contracts for SliqPay Africa's unified payment layer.

## 📁 Project Structure

```
smartcontracts/
├── contracts/          # Solidity smart contracts
├── scripts/           # Deployment and utility scripts
├── test/              # Test suites
├── deployments/       # Deployed contract addresses
├── TREASURY_VAULT_PRD.md   # Comprehensive Product Requirements Document
├── WORK_PLAN.md           # Quick reference work plan
└── README.md              # This file
```

## 🎯 Current Task

**Phase 2:** Implement & Deploy TreasuryVault.sol

**Branch:** `feat/treasury-vault-implementation`

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm or yarn
- MetaMask with Moonbase Alpha DEV tokens

### Setup Instructions

1. **Install dependencies:**
   ```bash
   cd smartcontracts
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Add your private key and RPC URLs
   ```

3. **Compile contracts:**
   ```bash
   npx hardhat compile
   ```

4. **Run tests:**
   ```bash
   npx hardhat test
   ```

5. **Deploy to Moonbase Alpha:**
   ```bash
   npx hardhat run scripts/deploy-treasury.js --network moonbase
   ```

## 📚 Documentation

- **Comprehensive PRD:** `TREASURY_VAULT_PRD.md` - Full technical specification
- **Work Plan:** `WORK_PLAN.md` - Development checklist and guidelines
- **Contract Architecture:** See PRD Section: "Contract Architecture"

## 🌐 Network Configuration

### Moonbase Alpha (Testnet)
- **Chain ID:** 1287
- **RPC URL:** https://rpc.api.moonbase.moonbeam.network
- **Block Explorer:** https://moonbase.moonscan.io
- **Faucet:** https://faucet.moonbeam.network

## 🏗️ Contract Overview

### TreasuryVault.sol
The central payment router and balance tracker for SliqPay.

**Key Features:**
- 🔄 Smart payment routing (native & ERC20 tokens)
- 💰 Multi-token balance ledger per SliqID
- 🔄 Asset conversion with FX Oracle integration
- 🔐 Admin controls & emergency pause
- 🛡️ ReentrancyGuard & security best practices

**Dependencies:**
- SliqIDRegistry (for identity resolution)
- MockFxOracle (for conversion rates)
- OpenZeppelin contracts

## 🧪 Testing

Run the full test suite:
```bash
npx hardhat test
```

Run with coverage:
```bash
npx hardhat coverage
```

Run specific test file:
```bash
npx hardhat test test/TreasuryVault.test.js
```

## 📝 Development Guidelines

### Code Quality
- Write code at **senior protocol engineer level**
- Use **NatSpec comments** for all public functions
- Explain **WHY** not just **WHAT** in comments
- Follow **OpenZeppelin** patterns and best practices

### Commit Strategy
- **Small, incremental commits** for each file
- Clear, descriptive commit messages
- Commit format: `feat: add [component]`

### Example
```bash
git add contracts/interfaces/ISliqIDRegistry.sol
git commit -m "feat: add ISliqIDRegistry interface

- Define interface for SliqID resolution
- Include registration check function"
```

## 🔐 Security

- ReentrancyGuard on all state-changing functions
- Access control with Ownable pattern
- SafeERC20 for all token transfers
- Pausable for emergency stops
- Input validation on all external functions

## 📦 Dependencies

```json
{
  "hardhat": "^2.x",
  "@openzeppelin/contracts": "^5.x",
  "@nomicfoundation/hardhat-toolbox": "^4.x",
  "ethers": "^6.x"
}
```

## 🤝 Contributing

This is a hackathon prototype. Development follows the phases outlined in `WORK_PLAN.md`.

Current phase: **Environment Setup → Interface Creation**

## 📞 Support

For questions about the contract architecture, refer to:
1. `TREASURY_VAULT_PRD.md` - Technical specifications
2. `WORK_PLAN.md` - Development checklist
3. `../contract-work.md` - Overall project requirements

---

**Status:** In Development 🚧
**Network:** Moonbase Alpha (Testnet)
**Framework:** Hardhat
**Solidity Version:** ^0.8.20
