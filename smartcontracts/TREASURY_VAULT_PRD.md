# TreasuryVault.sol - Product Requirements Document (PRD)

## Project Overview

**Contract Name:** TreasuryVault.sol
**Task ID:** Phase 2 - Hackathon Prototype
**Network:** Moonbase Alpha (Moonbeam Testnet)
**Framework:** Hardhat
**Solidity Version:** ^0.8.20

### Purpose
TreasuryVault.sol serves as the **central payment router and balance tracker** for SliqPay Africa's unified payment layer. It handles all incoming crypto transactions, routes assets to the correct recipients, maintains multi-token ledgers, and integrates with the SliqIDRegistry for identity resolution.

This contract effectively combines three core functionalities:
1. **Smart Router** - Payment routing and token detection
2. **Crypto Ledger** - Multi-token balance tracking per SliqID
3. **FX Oracle Integration** - Asset conversion support (optional for testing)

---

## Technical Requirements

### Dependencies

#### External Contracts
- **SliqIDRegistry.sol** (must be deployed first)
  - Used for resolving SliqIDs to wallet addresses
  - Interface: `resolveAddress(string sliqId) → address`

- **MockFxOracle.sol** (for testing conversions)
  - Provides token-to-fiat conversion rates
  - Interface: `getRate(address token) → uint256`

#### OpenZeppelin Libraries
```solidity
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
```

### Supported Token Types
- **Native Token:** ETH (or GLMR on Moonbase Alpha)
- **ERC20 Tokens:**
  - USDT (Tether)
  - USDC (USD Coin)
  - DAI (Dai Stablecoin)
  - Any ERC20-compliant token

---

## Contract Architecture

### State Variables

```solidity
// Registry reference
ISliqIDRegistry public sliqIDRegistry;

// FX Oracle reference (optional)
IMockFxOracle public fxOracle;

// Multi-token ledger: sliqID => token => balance
mapping(string => mapping(address => uint256)) public sliqBalances;

// Admin roles
address public admin;
mapping(address => bool) public operators;

// Constants
address public constant NATIVE_TOKEN = address(0); // Represents ETH/GLMR
```

### Core Functional Modules

#### 🔹 A. Smart Routing Layer

**Functionality:**
- Detects incoming payment token type (native vs ERC20)
- Validates recipient SliqID via SliqIDRegistry
- Routes payment to appropriate ledger
- Emits routing events for backend tracking

**Functions:**
```solidity
function routePayment(
    string memory recipientSliqId,
    address token,
    uint256 amount
) external payable nonReentrant whenNotPaused

function routePaymentNative(
    string memory recipientSliqId
) external payable nonReentrant whenNotPaused
```

**Validation Logic:**
- Recipient SliqID must exist in registry
- Token amount must be > 0
- Sender must have approved contract (for ERC20)
- For native payments: msg.value must match amount

**Events:**
```solidity
event PaymentRouted(
    address indexed sender,
    string indexed recipientSliqId,
    address indexed token,
    uint256 amount,
    uint256 timestamp
);
```

---

#### 🔹 B. Crypto Ledger Layer

**Functionality:**
- Maintains per-token balances for every SliqID
- Supports credit/debit operations
- Provides balance query functions
- Atomic updates during routing

**Data Structure:**
```solidity
mapping(string => mapping(address => uint256)) public sliqBalances;
// Example: sliqBalances["@maryam"][USDTAddress] = 1000_000000 (1000 USDT)
```

**Functions:**
```solidity
function creditSliqID(
    string memory sliqId,
    address token,
    uint256 amount
) internal

function debitSliqID(
    string memory sliqId,
    address token,
    uint256 amount
) internal

function getBalance(
    string memory sliqId,
    address token
) external view returns (uint256)

function getBalances(
    string memory sliqId,
    address[] memory tokens
) external view returns (uint256[] memory)
```

**Events:**
```solidity
event BalanceUpdated(
    string indexed sliqId,
    address indexed token,
    uint256 newBalance,
    uint256 timestamp
);
```

---

#### 🔹 C. Conversion Layer (Optional FX Oracle Integration)

**Functionality:**
- Enables token-to-token conversions
- Fetches conversion rates from MockFxOracle
- Updates balances for both sender and receiver
- Supports internal testing of multi-asset scenarios

**Functions:**
```solidity
function convertAsset(
    string memory fromSliqId,
    string memory toSliqId,
    address fromToken,
    address toToken,
    uint256 amount
) external nonReentrant whenNotPaused onlyOperator

function getConversionRate(
    address fromToken,
    address toToken
) public view returns (uint256)
```

**Conversion Logic:**
```
1. Fetch rate from Oracle
2. Validate sender has sufficient balance
3. Calculate converted amount
4. Debit sender's fromToken balance
5. Credit receiver's toToken balance
6. Emit conversion event
```

**Events:**
```solidity
event AssetConverted(
    string indexed fromSliqId,
    string indexed toSliqId,
    address fromToken,
    address toToken,
    uint256 fromAmount,
    uint256 toAmount,
    uint256 rate,
    uint256 timestamp
);
```

---

#### 🔹 D. Admin & Security Controls

**Functionality:**
- Role-based access control (Admin, Operator)
- Emergency pause mechanism
- Withdrawal for settlement or service provider payout
- Configuration updates

**Functions:**
```solidity
// Admin functions
function withdraw(
    address token,
    uint256 amount,
    address to
) external onlyOwner

function withdrawNative(
    uint256 amount,
    address payable to
) external onlyOwner

function setSliqIDRegistry(address _registry) external onlyOwner
function setFxOracle(address _oracle) external onlyOwner

// Operator management
function addOperator(address operator) external onlyOwner
function removeOperator(address operator) external onlyOwner

// Emergency controls
function pause() external onlyOwner
function unpause() external onlyOwner
```

**Events:**
```solidity
event Withdrawn(address indexed token, uint256 amount, address indexed to);
event OperatorAdded(address indexed operator);
event OperatorRemoved(address indexed operator);
event RegistryUpdated(address indexed newRegistry);
event OracleUpdated(address indexed newOracle);
```

**Security Features:**
- ReentrancyGuard on all state-changing functions
- Pausable for emergency stops
- Ownable for admin control
- SafeERC20 for secure token transfers
- Input validation on all external functions

---

## Interface Definitions

### ISliqIDRegistry.sol
```solidity
interface ISliqIDRegistry {
    function resolveAddress(string memory sliqId) external view returns (address);
    function isSliqIDRegistered(string memory sliqId) external view returns (bool);
}
```

### IMockFxOracle.sol
```solidity
interface IMockFxOracle {
    function getRate(address token) external view returns (uint256);
    function setRate(address token, uint256 rateInNGN) external;
}
```

---

## Development Phases

### Phase 1: Environment Setup ✅
- [x] Create `smartcontracts` folder structure
- [x] Create new branch `feat/treasury-vault-implementation`
- [ ] Initialize Hardhat project
- [ ] Install dependencies (OpenZeppelin, ethers, etc.)
- [ ] Configure Moonbase Alpha network in hardhat.config.js
- [ ] Set up .env file with private keys

### Phase 2: Interface & Mock Contracts
- [ ] Create `ISliqIDRegistry.sol` interface
- [ ] Create `IMockFxOracle.sol` interface
- [ ] Create mock SliqIDRegistry for testing
- [ ] Create mock FxOracle for testing

### Phase 3: Core Contract Implementation
- [ ] Implement state variables and constructor
- [ ] Implement Smart Routing Layer
  - [ ] `routePayment()` function
  - [ ] `routePaymentNative()` function
  - [ ] Token detection logic
  - [ ] SliqID validation
- [ ] Implement Crypto Ledger Layer
  - [ ] `creditSliqID()` internal function
  - [ ] `debitSliqID()` internal function
  - [ ] `getBalance()` view function
  - [ ] `getBalances()` batch query
- [ ] Implement Conversion Layer
  - [ ] `convertAsset()` function
  - [ ] `getConversionRate()` helper
  - [ ] Oracle integration logic
- [ ] Implement Admin & Security Controls
  - [ ] `withdraw()` functions
  - [ ] Operator management
  - [ ] Configuration setters
  - [ ] Emergency pause/unpause

### Phase 4: Testing
- [ ] Unit tests for Smart Routing
  - [ ] Test native token routing
  - [ ] Test ERC20 token routing
  - [ ] Test invalid SliqID handling
  - [ ] Test zero amount rejection
- [ ] Unit tests for Crypto Ledger
  - [ ] Test balance credit/debit
  - [ ] Test balance queries
  - [ ] Test multi-token balances
- [ ] Unit tests for Conversion Layer
  - [ ] Test asset conversion with mock Oracle
  - [ ] Test insufficient balance handling
  - [ ] Test rate calculation
- [ ] Unit tests for Admin Controls
  - [ ] Test withdrawal functions
  - [ ] Test pause/unpause
  - [ ] Test operator permissions
  - [ ] Test access control
- [ ] Integration tests
  - [ ] Test full payment flow with SliqIDRegistry
  - [ ] Test conversion flow with Oracle
  - [ ] Test edge cases and error handling

### Phase 5: Deployment
- [ ] Deploy mock contracts to Moonbase Alpha
  - [ ] Deploy MockSliqIDRegistry
  - [ ] Deploy MockFxOracle
- [ ] Deploy TreasuryVault to Moonbase Alpha
- [ ] Verify contracts on Moonscan
- [ ] Configure contract settings
  - [ ] Set SliqIDRegistry address
  - [ ] Set FxOracle address
  - [ ] Add operators if needed
- [ ] Test on-chain interactions
- [ ] Document deployment addresses

### Phase 6: Documentation & Handoff
- [ ] Create deployment guide
- [ ] Document contract addresses
- [ ] Create integration guide for backend team
- [ ] Write API reference for contract functions
- [ ] Create frontend integration examples

---

## File Structure

```
smartcontracts/
├── contracts/
│   ├── TreasuryVault.sol          # Main contract
│   ├── interfaces/
│   │   ├── ISliqIDRegistry.sol    # Registry interface
│   │   └── IMockFxOracle.sol      # Oracle interface
│   └── mocks/
│       ├── MockSliqIDRegistry.sol # Test registry
│       ├── MockFxOracle.sol       # Test oracle
│       └── MockERC20.sol          # Test tokens
├── scripts/
│   ├── deploy-mocks.js            # Deploy test contracts
│   ├── deploy-treasury.js         # Deploy TreasuryVault
│   ├── configure.js               # Post-deployment config
│   └── verify.js                  # Verify on Moonscan
├── test/
│   ├── TreasuryVault.test.js      # Main test suite
│   ├── routing.test.js            # Routing tests
│   ├── ledger.test.js             # Ledger tests
│   ├── conversion.test.js         # Conversion tests
│   └── admin.test.js              # Admin control tests
├── deployments/
│   └── moonbase-alpha.json        # Deployment addresses
├── hardhat.config.js              # Hardhat configuration
├── package.json                   # Dependencies
├── .env.example                   # Environment template
└── README.md                      # Setup instructions
```

---

## Network Configuration

### Moonbase Alpha Details
- **Network Name:** Moonbase Alpha
- **Chain ID:** 1287
- **RPC URL:** https://rpc.api.moonbase.moonbeam.network
- **Currency Symbol:** DEV
- **Block Explorer:** https://moonbase.moonscan.io/

### Environment Variables (.env)
```bash
# Private key for deployment (you'll provide this)
PRIVATE_KEY=your_private_key_here

# Network RPC
MOONBASE_RPC_URL=https://rpc.api.moonbase.moonbeam.network

# Moonscan API key (optional, for verification)
MOONSCAN_API_KEY=your_api_key_here

# Contract addresses (after deployment)
SLIQ_ID_REGISTRY_ADDRESS=
MOCK_FX_ORACLE_ADDRESS=
TREASURY_VAULT_ADDRESS=
```

---

## Testing Strategy

### Test Coverage Requirements
- **Minimum Coverage:** 90%
- **Critical Functions:** 100% coverage required
- **Edge Cases:** All revert conditions must be tested

### Test Categories

#### 1. Unit Tests
- Test each function in isolation
- Mock all external dependencies
- Cover all success and failure paths

#### 2. Integration Tests
- Test contract interactions
- Use actual mock contracts
- Test full user flows

#### 3. Security Tests
- Test reentrancy protection
- Test access control
- Test pause mechanism
- Test integer overflow/underflow

#### 4. Gas Optimization Tests
- Measure gas costs for common operations
- Identify optimization opportunities

### Test Scenarios

**Routing Tests:**
- ✅ Route native token payment to valid SliqID
- ✅ Route ERC20 payment to valid SliqID
- ❌ Route payment to non-existent SliqID
- ❌ Route zero amount payment
- ❌ Route without token approval (ERC20)
- ❌ Route with insufficient balance

**Ledger Tests:**
- ✅ Credit balance updates correctly
- ✅ Debit balance updates correctly
- ✅ Query single token balance
- ✅ Query multiple token balances
- ❌ Debit more than available balance

**Conversion Tests:**
- ✅ Convert between two tokens successfully
- ✅ Correct rate calculation
- ✅ Both balances update correctly
- ❌ Convert with insufficient balance
- ❌ Convert without operator role

**Admin Tests:**
- ✅ Owner can withdraw funds
- ✅ Owner can pause/unpause
- ✅ Owner can add/remove operators
- ❌ Non-owner cannot call admin functions
- ❌ Cannot withdraw more than contract balance

---

## Security Considerations

### Known Attack Vectors

#### 1. Reentrancy Attacks
**Mitigation:** Use OpenZeppelin's ReentrancyGuard on all state-changing functions

#### 2. Access Control
**Mitigation:** Use Ownable and custom operator role checks

#### 3. Integer Overflow/Underflow
**Mitigation:** Solidity 0.8+ has built-in overflow checks

#### 4. Front-Running
**Mitigation:** Consider using commit-reveal pattern for conversions (future enhancement)

#### 5. Denial of Service
**Mitigation:**
- Pausable for emergency stops
- Gas-efficient loops
- No unbounded arrays

#### 6. Token Transfer Failures
**Mitigation:** Use SafeERC20 for all token operations

### Audit Checklist
- [ ] All external calls use ReentrancyGuard
- [ ] All admin functions check ownership
- [ ] All token transfers use SafeERC20
- [ ] All inputs are validated
- [ ] All critical operations emit events
- [ ] Contract is pausable
- [ ] No floating pragma versions
- [ ] No use of tx.origin
- [ ] No delegatecall to untrusted contracts

---

## User Flows

### Flow 1: Native Token Payment
```
1. User calls routePaymentNative("@maryam") with 1 ETH
2. Contract validates @maryam exists in SliqIDRegistry
3. Contract credits @maryam's balance: sliqBalances["@maryam"][address(0)] += 1 ETH
4. Emit PaymentRouted event
5. Backend listens for event and updates UI
```

### Flow 2: ERC20 Token Payment
```
1. User approves TreasuryVault to spend 1000 USDT
2. User calls routePayment("@john", USDTAddress, 1000 USDT)
3. Contract validates @john exists in SliqIDRegistry
4. Contract transfers 1000 USDT from user to TreasuryVault
5. Contract credits @john's balance: sliqBalances["@john"][USDTAddress] += 1000 USDT
6. Emit PaymentRouted event
```

### Flow 3: Asset Conversion
```
1. Operator calls convertAsset("@alice", "@bob", USDT, USDC, 1000)
2. Contract fetches USDT → USDC rate from Oracle
3. Contract validates @alice has ≥ 1000 USDT balance
4. Contract debits @alice's USDT balance
5. Contract calculates converted amount (e.g., 1000 USDC)
6. Contract credits @bob's USDC balance
7. Emit AssetConverted event
```

### Flow 4: Balance Query
```
1. Frontend calls getBalance("@maryam", USDTAddress)
2. Contract returns: sliqBalances["@maryam"][USDTAddress]
3. Frontend displays balance to user
```

### Flow 5: Admin Withdrawal
```
1. Admin calls withdraw(USDTAddress, 10000, treasuryWallet)
2. Contract validates caller is owner
3. Contract transfers 10000 USDT to treasuryWallet
4. Emit Withdrawn event
```

---

## Timeline & Milestones

### Week 1: Setup & Implementation
- **Day 1-2:** Environment setup, Hardhat config, interface creation
- **Day 3-4:** Core contract implementation (Routing + Ledger)
- **Day 5-6:** Conversion layer + Admin controls
- **Day 7:** Code review and refactoring

### Week 2: Testing & Deployment
- **Day 1-3:** Comprehensive test suite development
- **Day 4:** Test coverage analysis and fixes
- **Day 5:** Deploy to Moonbase Alpha testnet
- **Day 6:** On-chain testing and verification
- **Day 7:** Documentation and handoff

---

## Success Criteria

### Functional Requirements ✅
- [ ] Contract successfully deploys to Moonbase Alpha
- [ ] All routing functions work as expected
- [ ] Balance tracking is accurate across multiple tokens
- [ ] Asset conversion works with Oracle integration
- [ ] Admin controls function properly
- [ ] Emergency pause works

### Technical Requirements ✅
- [ ] Test coverage ≥ 90%
- [ ] All security checks pass
- [ ] Gas optimization complete
- [ ] Contract verified on Moonscan
- [ ] All events emit correctly

### Integration Requirements ✅
- [ ] Backend can interact with contract
- [ ] Frontend can query balances
- [ ] SliqIDRegistry integration works
- [ ] Oracle integration works

---

## Integration Guide for Backend/Frontend

### Contract ABI Functions

**For Backend:**
```javascript
// Route payment
await treasuryVault.routePayment(
  "@recipient",
  tokenAddress,
  ethers.parseUnits("100", 6) // 100 USDT
);

// Check balance
const balance = await treasuryVault.getBalance("@user", tokenAddress);

// Listen for events
treasuryVault.on("PaymentRouted", (sender, sliqId, token, amount, timestamp) => {
  console.log(`Payment received: ${amount} to ${sliqId}`);
});
```

**For Frontend:**
```javascript
// Query user's multi-token balances
const tokens = [USDTAddress, USDCAddress, DAIAddress];
const balances = await treasuryVault.getBalances("@maryam", tokens);

// Display in UI
balances.forEach((balance, i) => {
  console.log(`${tokenNames[i]}: ${ethers.formatUnits(balance, decimals[i])}`);
});
```

---

## Next Steps

1. **Immediate:** Review and approve this PRD
2. **Next:** Initialize Hardhat project and install dependencies
3. **Then:** Begin Phase 2 implementation (interfaces and mocks)
4. **After:** Implement core TreasuryVault contract
5. **Finally:** Test, deploy, and integrate

---

## Questions & Clarifications

### To Discuss:
1. Should we implement gas token support (wGLMR on Moonbase)?
2. What should be the minimum withdrawal amount for admin?
3. Should operators have conversion limits?
4. Do we need batch routing for multiple payments?
5. Should we implement a fee mechanism (e.g., 0.1% platform fee)?

---

## References

- **SliqPay Contract Work Doc:** `contract-work.md`
- **OpenZeppelin Docs:** https://docs.openzeppelin.com/contracts/
- **Hardhat Docs:** https://hardhat.org/docs
- **Moonbeam Docs:** https://docs.moonbeam.network/
- **Moonbase Alpha Faucet:** https://faucet.moonbeam.network/

---

**Document Version:** 1.0
**Last Updated:** 2025-11-07
**Author:** SliqPay Development Team
**Status:** Ready for Implementation 🚀
