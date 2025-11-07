# TreasuryVault.sol - Quick Work Plan

## 🎯 Objective
Implement and deploy TreasuryVault.sol - the central payment router and balance tracker for SliqPay Africa's unified payment layer.

---

## 📋 Development Checklist

### ✅ Phase 1: Environment Setup (COMPLETED)
- [x] Create smartcontracts folder structure
- [x] Create branch: `feat/treasury-vault-implementation`
- [x] Create comprehensive PRD
- [ ] Initialize Hardhat project
- [ ] Configure Moonbase Alpha network
- [ ] Set up .env file

### Phase 2: Interfaces & Mocks
- [ ] ISliqIDRegistry.sol
- [ ] IMockFxOracle.sol
- [ ] MockSliqIDRegistry.sol
- [ ] MockFxOracle.sol
- [ ] MockERC20.sol

### Phase 3: Core Contract
- [ ] State variables & constructor
- [ ] Smart Routing Layer (routePayment functions)
- [ ] Crypto Ledger Layer (credit/debit/getBalance)
- [ ] Conversion Layer (convertAsset)
- [ ] Admin Controls (withdraw, pause, operators)

### Phase 4: Testing
- [ ] Unit tests: Routing
- [ ] Unit tests: Ledger
- [ ] Unit tests: Conversion
- [ ] Unit tests: Admin
- [ ] Integration tests
- [ ] Security tests

### Phase 5: Deployment
- [ ] Deploy mocks to Moonbase Alpha
- [ ] Deploy TreasuryVault
- [ ] Verify on Moonscan
- [ ] Configure contract
- [ ] On-chain testing

### Phase 6: Documentation
- [ ] Deployment addresses
- [ ] Integration guide
- [ ] API reference
- [ ] Handoff to backend/frontend

---

## 🏗️ Contract Structure

```
TreasuryVault.sol
├── A. Smart Routing Layer
│   ├── routePayment() - ERC20 routing
│   └── routePaymentNative() - Native token routing
├── B. Crypto Ledger Layer
│   ├── creditSliqID() - Internal credit
│   ├── debitSliqID() - Internal debit
│   ├── getBalance() - Single token query
│   └── getBalances() - Multi-token query
├── C. Conversion Layer
│   ├── convertAsset() - Token-to-token conversion
│   └── getConversionRate() - Rate fetcher
└── D. Admin & Security
    ├── withdraw() - ERC20 withdrawal
    ├── withdrawNative() - Native withdrawal
    ├── pause/unpause() - Emergency controls
    └── Operator management
```

---

## 🔑 Key Dependencies

1. **SliqIDRegistry** - For resolving SliqIDs to addresses
2. **MockFxOracle** - For conversion rates (testing)
3. **OpenZeppelin** - Security & access control

---

## 🌐 Network Info

**Moonbase Alpha (Moonbeam Testnet)**
- Chain ID: 1287
- RPC: https://rpc.api.moonbase.moonbeam.network
- Explorer: https://moonbase.moonscan.io
- Faucet: https://faucet.moonbeam.network

---

## 📝 Development Guidelines

### Code Quality Standards
- **Comment Style:** Senior protocol engineer level
- **Function Documentation:** NatSpec format with:
  - `@notice` - What the function does
  - `@dev` - Implementation details
  - `@param` - Parameter descriptions
  - `@return` - Return value descriptions
- **Code Comments:** Explain WHY, not just WHAT
- **Security:** Comment all security considerations

### Commit Strategy
- **Small, incremental commits** for each file
- **Commit message format:**
  ```
  feat: add [component name]

  - Detailed description of what was added
  - Any important implementation notes
  ```

### Example Commit Flow
```bash
# After creating interface
git add contracts/interfaces/ISliqIDRegistry.sol
git commit -m "feat: add ISliqIDRegistry interface

- Define interface for SliqID resolution
- Include isSliqIDRegistered check function"

# After creating mock
git add contracts/mocks/MockSliqIDRegistry.sol
git commit -m "feat: add MockSliqIDRegistry for testing

- Implement test version of registry
- Support add/remove SliqID for tests"
```

---

## 🧪 Testing Requirements

- **Coverage Target:** ≥ 90%
- **Critical Functions:** 100% coverage
- **Test Categories:**
  - Unit tests (isolated functions)
  - Integration tests (full flows)
  - Security tests (attack vectors)
  - Gas optimization tests

---

## 🚀 Next Steps

1. **Initialize Hardhat:**
   ```bash
   cd smartcontracts
   npm init -y
   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
   npx hardhat init
   ```

2. **Install Dependencies:**
   ```bash
   npm install @openzeppelin/contracts
   npm install --save-dev @nomicfoundation/hardhat-verify
   ```

3. **Configure Network:**
   - Edit `hardhat.config.js`
   - Add Moonbase Alpha configuration
   - Set up .env file

4. **Start Implementation:**
   - Begin with interfaces
   - Then mocks
   - Then core contract
   - Test as you go

---

## 📚 Reference Documents

- **Comprehensive PRD:** `TREASURY_VAULT_PRD.md`
- **Project Requirements:** `../contract-work.md`
- **OpenZeppelin:** https://docs.openzeppelin.com/contracts/
- **Hardhat:** https://hardhat.org/docs
- **Moonbeam:** https://docs.moonbeam.network/

---

## ⏱️ Estimated Timeline

- **Week 1:** Setup + Implementation (5-7 days)
- **Week 2:** Testing + Deployment (5-7 days)
- **Total:** 10-14 days

---

**Status:** Ready to begin implementation 🎯
**Branch:** `feat/treasury-vault-implementation`
**Next Action:** Initialize Hardhat project
