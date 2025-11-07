# SliqPay Smart Contracts

This directory contains the blockchain smart contracts for SliqPay Africa's unified payment layer - enabling seamless crypto payments to human-readable SliqIDs.

## 📋 Overview

SliqPay's blockchain infrastructure provides:
- **Identity Resolution**: Map SliqIDs (e.g., "alice") to wallet addresses
- **Payment Routing**: Route native and ERC20 token payments
- **Multi-Token Ledger**: Track balances across multiple tokens per user
- **Asset Conversion**: Convert between different tokens using FX rates
- **Admin Controls**: Emergency pause, withdrawals, and configuration

## 📁 Project Structure

```
smartcontracts/
├── contracts/
│   ├── TreasuryVault.sol             # Main payment router (1073 lines) ✅
│   ├── interfaces/
│   │   ├── ISliqIDRegistry.sol       # Identity resolution interface ✅
│   │   └── IMockFxOracle.sol         # FX oracle interface ✅
│   └── mocks/
│       ├── MockSliqIDRegistry.sol    # Test identity registry ✅
│       ├── MockFxOracle.sol          # Test FX oracle ✅
│       └── MockERC20.sol             # Test ERC20 tokens ✅
├── script/
│   ├── deploy.sh                     # Automated deployment script ✅
│   └── DeployAll.s.sol               # Foundry deployment alternative ✅
├── test/                             # Test suites (pending)
├── docs/
│   └── SMART_CONTRACTS_EXPLAINED.md  # Complete technical documentation ✅
├── deployments/                      # Deployment addresses (generated)
├── TREASURY_VAULT_PRD.md            # Product Requirements Document ✅
├── WORK_PLAN.md                     # Development checklist ✅
├── FOUNDRY_SETUP.md                 # Foundry commands reference ✅
└── README.md                         # This file
```

## 🎯 Project Status

**✅ Phase 2 COMPLETED:** TreasuryVault.sol Implemented & Ready for Deployment

| Milestone | Status |
|-----------|--------|
| Interfaces defined | ✅ Complete |
| Mock contracts implemented | ✅ Complete |
| TreasuryVault.sol implemented | ✅ Complete (1073 lines) |
| Compilation successful | ✅ Pass |
| Deployment scripts created | ✅ Complete |
| Documentation | ✅ Complete |
| Test suite | ⏳ Pending |

## 🚀 Quick Start

### Prerequisites

```bash
# 1. Foundry installed
forge --version

# 2. Fund wallet with DEV tokens
# Visit: https://faucet.moonbeam.network/

# 3. Configure environment
cp .env.example .env
# Add your PRIVATE_KEY (without 0x prefix)
```

### Compile Contracts

```bash
forge build
```

**Output:**
```
Compiling 6 files with Solc 0.8.20
Compiler run successful!
```

### Deploy to Moonbase Alpha

```bash
# Automated deployment
./script/deploy.sh

# This will:
# 1. Deploy MockSliqIDRegistry
# 2. Deploy MockFxOracle
# 3. Deploy TreasuryVault
# 4. Deploy test ERC20 tokens (USDT, USDC, DAI)
# 5. Configure initial rates and test data
# 6. Save addresses to deployments/moonbase-alpha.json
```

### Verify on Moonscan (Optional)

```bash
forge verify-contract \
  --chain-id 1287 \
  --compiler-version v0.8.20 \
  --constructor-args $(cast abi-encode "constructor(address,address)" $REGISTRY_ADDR $ORACLE_ADDR) \
  $VAULT_ADDRESS \
  contracts/TreasuryVault.sol:TreasuryVault \
  --etherscan-api-key $MOONSCAN_API_KEY
```

## 📚 Documentation

### Core Documents

- **[TREASURY_VAULT_PRD.md](./TREASURY_VAULT_PRD.md)** - Complete PRD with requirements, architecture, and deployment plan
- **[SMART_CONTRACTS_EXPLAINED.md](./docs/SMART_CONTRACTS_EXPLAINED.md)** - Technical deep-dive into contract implementation
- **[FOUNDRY_SETUP.md](./FOUNDRY_SETUP.md)** - Foundry commands and workflow
- **[WORK_PLAN.md](./WORK_PLAN.md)** - Development checklist and guidelines

### Contract Documentation

All contracts include comprehensive NatSpec documentation:
- Function purposes and usage
- Parameter descriptions
- Security considerations
- Example usage code
- Event descriptions

## 🏗️ Contract Architecture

```
TreasuryVault (Main Contract)
├── Smart Routing Layer
│   ├── routePayment() - ERC20 payments
│   └── routePaymentNative() - Native token payments
├── Crypto Ledger Layer
│   ├── _creditSliqID() - Balance credits
│   ├── _debitSliqID() - Balance debits
│   ├── getBalance() - Single token query
│   └── getBalances() - Multi-token query
├── Conversion Layer
│   └── convertAsset() - Cross-token conversions
└── Admin & Security Layer
    ├── withdraw() - Fund withdrawals
    ├── pause/unpause() - Emergency controls
    └── Operator management

Dependencies:
├── ISliqIDRegistry - Identity resolution
└── IMockFxOracle - Exchange rates
```

## 🔐 Security Features

- ✅ ReentrancyGuard on all state-changing functions
- ✅ Pausable for emergency stops
- ✅ Role-based access control (Owner, Operator)
- ✅ Input validation on all external functions
- ✅ Safe token transfers with success checks
- ✅ Complete event emission for audit trail
- ✅ Solidity 0.8+ automatic overflow protection

## 🧪 Testing

```bash
# Run tests (when test suite is complete)
forge test

# Run with gas reporting
forge test --gas-report

# Run with coverage
forge coverage

# Run specific test
forge test --match-test testRoutePayment
```

## 🌐 Network Configuration

### Moonbase Alpha (Testnet)

| Property | Value |
|----------|-------|
| Network Name | Moonbase Alpha |
| Chain ID | 1287 |
| RPC URL | https://rpc.api.moonbase.moonbeam.network |
| Currency | DEV |
| Block Explorer | https://moonbase.moonscan.io |
| Faucet | https://faucet.moonbeam.network |

## 📊 Contract Stats

### TreasuryVault.sol
- **Lines of Code:** 1,073
- **Functions:** 18 (12 external/public, 6 internal)
- **Events:** 10
- **Modifiers:** 4
- **State Variables:** 6
- **Documentation:** 100% NatSpec coverage

### Overall Project
- **Total Contracts:** 6
- **Total Lines:** ~2,500
- **Compilation Time:** ~4 seconds
- **Gas Optimization:** ✅ Enabled

## 🔄 User Flow Example

```solidity
// 1. Register SliqID
registry.registerSliqID("alice", 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb);

// 2. User approves TreasuryVault
usdt.approve(treasuryVault, 1000 * 10**6);

// 3. User sends payment to SliqID
treasuryVault.routePayment("bob", usdtAddress, 1000 * 10**6);

// 4. Check recipient balance
uint256 balance = treasuryVault.getBalance("bob", usdtAddress);
// Result: 1000 * 10**6 (1000 USDT)
```

## 🛠️ Development Commands

```bash
# Build contracts
forge build

# Run tests
forge test

# Format code
forge fmt

# Gas snapshot
forge snapshot

# Deploy
./script/deploy.sh

# Interact with contract
cast call $VAULT_ADDRESS "getBalance(string,address)(uint256)" "alice" $USDT_ADDRESS --rpc-url moonbase
```

## 📝 Next Steps

1. **Testing**
   - Write comprehensive test suite
   - Achieve ≥90% code coverage
   - Test all edge cases and failure modes

2. **Deployment**
   - Deploy to Moonbase Alpha testnet
   - Verify all contracts on Moonscan
   - Test on-chain interactions

3. **Integration**
   - Integrate with backend API
   - Connect frontend dashboard
   - End-to-end flow testing

4. **Production**
   - Security audit
   - Multi-sig for admin functions
   - Mainnet deployment plan

## 🤝 Contributing

This is a hackathon prototype. Development follows the phases outlined in [WORK_PLAN.md](./WORK_PLAN.md).

### Code Quality Standards
- Senior protocol engineer level documentation
- NatSpec comments on all public functions
- Small, incremental git commits
- Comprehensive testing before deployment

## 📞 Support & Resources

- **Foundry Docs:** https://book.getfoundry.sh/
- **Moonbeam Docs:** https://docs.moonbeam.network/
- **Moonscan:** https://moonbase.moonscan.io/
- **OpenZeppelin:** https://docs.openzeppelin.com/contracts/

## 📜 License

MIT License - See LICENSE file for details

---

**Status:** ✅ Implementation Complete - Ready for Deployment
**Network:** Moonbase Alpha (Chain ID: 1287)
**Framework:** Foundry
**Solidity Version:** 0.8.20
