# SliqPay Smart Contracts - Technical Documentation

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Contract Architecture](#contract-architecture)
3. [Interfaces](#interfaces)
4. [Mock Contracts](#mock-contracts)
5. [TreasuryVault Contract](#treasuryvault-contract)
6. [Data Flow & Interactions](#data-flow--interactions)
7. [Security Considerations](#security-considerations)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Guide](#deployment-guide)

---

## System Overview

SliqPay's blockchain layer provides a unified payment infrastructure that bridges Web2 and Web3 users through human-readable identifiers (SliqIDs) and multi-token support.

### Core Functionality
- **Identity Resolution**: Map SliqIDs (e.g., "@maryam") to wallet addresses
- **Payment Routing**: Route crypto payments to correct recipients
- **Multi-Token Ledger**: Track balances across multiple tokens per user
- **Asset Conversion**: Convert between different tokens using FX rates
- **Admin Controls**: Manage withdrawals, pausing, and system configuration

### Design Philosophy
1. **Simplicity**: Clear, focused contracts with single responsibilities
2. **Security**: Multiple layers of protection (ReentrancyGuard, Pausable, access control)
3. **Testability**: Mock contracts for isolated testing
4. **Gas Efficiency**: Optimized storage and operations
5. **Upgradeability**: Modular design allows component replacement

---

## Contract Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SliqPay Ecosystem                        │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐        ┌──────────────────────┐
│                      │        │                      │
│  SliqIDRegistry      │◄───────┤   TreasuryVault      │
│                      │        │  (Main Contract)     │
│  Identity Layer      │        │                      │
│                      │        │  ┌─────────────────┐ │
│  @user -> 0xAddr     │        │  │ Smart Router    │ │
│                      │        │  │ Crypto Ledger   │ │
└──────────────────────┘        │  │ Conversion      │ │
                                │  │ Admin Controls  │ │
                                │  └─────────────────┘ │
                                │         │            │
                                └─────────┼────────────┘
                                          │
                                          ▼
                                ┌──────────────────────┐
                                │                      │
                                │   FxOracle           │
                                │                      │
                                │   Rate Provider      │
                                │   USDT -> ₦1,500     │
                                │   USDC -> ₦1,500     │
                                │                      │
                                └──────────────────────┘

Supporting Contracts:
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  MockERC20  │  │  MockERC20  │  │  MockERC20  │
│    USDT     │  │    USDC     │  │     DAI     │
└─────────────┘  └─────────────┘  └─────────────┘
```

---

## Interfaces

Interfaces define the contract specifications and ensure compatibility between components.

### ISliqIDRegistry.sol

**Purpose**: Defines the identity resolution layer

**Key Functions**:
```solidity
function resolveAddress(string memory sliqId) external view returns (address);
function isSliqIDRegistered(string memory sliqId) external view returns (bool);
function getSliqIDByAddress(address wallet) external view returns (string memory);
```

**Events**:
- `SliqIDRegistered(string sliqId, address wallet, uint256 timestamp)`
- `SliqIDUpdated(string sliqId, address oldWallet, address newWallet, uint256 timestamp)`

**Usage by TreasuryVault**:
```solidity
// Before routing payment, validate recipient exists
address recipientWallet = sliqIDRegistry.resolveAddress("@maryam");
require(recipientWallet != address(0), "Recipient not found");
```

**Design Rationale**:
- **Why bidirectional mapping?** Allows reverse lookup for UIs (show "@alice" instead of 0x123...)
- **Why isSliqIDRegistered?** Pre-validation prevents failed transactions and saves gas
- **Why events?** Backend can listen for registrations and sync with database

---

### IMockFxOracle.sol

**Purpose**: Provides token conversion rates for cross-asset routing

**Key Functions**:
```solidity
function getRate(address token) external view returns (uint256);
function setRate(address token, uint256 rateInNGN) external;
function isTokenSupported(address token) external view returns (bool);
function convertAmount(address fromToken, address toToken, uint256 amount)
    external view returns (uint256);
```

**Events**:
- `RateUpdated(address token, uint256 oldRate, uint256 newRate, uint256 timestamp)`

**Rate Format**:
```
Rate represents: 1 token unit = X base currency units (NGN)

Examples:
- setRate(USDT, 1500)  => 1 USDT = ₦1,500
- setRate(ETH, 5000)   => 1 ETH = ₦5,000
- setRate(DAI, 1485)   => 1 DAI = ₦1,485 (slight depeg)
```

**Conversion Logic**:
```solidity
// Convert 100 USDT to USDC
uint256 usdtRate = 1500;  // ₦1,500 per USDT
uint256 usdcRate = 1500;  // ₦1,500 per USDC
uint256 usdcAmount = (100 * usdtRate) / usdcRate;  // = 100 USDC (1:1)

// Convert 100 USDT to DAI (with depeg)
uint256 daiRate = 1485;   // ₦1,485 per DAI
uint256 daiAmount = (100 * 1500) / 1485;  // ≈ 101.01 DAI
```

**Design Rationale**:
- **Why mock oracle?** Allows testing without external dependencies (Chainlink)
- **Why NGN base?** SliqPay targets Nigerian market, rates in local currency
- **Why convertAmount helper?** Encapsulates conversion logic, prevents implementation errors

**Production Upgrade Path**:
```solidity
// Replace with Chainlink Price Feed
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

function getRate(address token) external view returns (uint256) {
    AggregatorV3Interface priceFeed = AggregatorV3Interface(priceFeeds[token]);
    (, int256 price, , , ) = priceFeed.latestRoundData();
    return uint256(price);
}
```

---

## Mock Contracts

Mock contracts provide controlled test environments for validating TreasuryVault functionality.

### MockSliqIDRegistry.sol

**Implementation Highlights**:

```solidity
contract MockSliqIDRegistry is ISliqIDRegistry {
    // Bidirectional mapping for efficient lookups
    mapping(string => address) private sliqIdToWallet;
    mapping(address => string) private walletToSliqId;

    function registerSliqID(string memory sliqId, address wallet) external {
        // Validation
        require(bytes(sliqId).length > 0, "empty SliqID");
        require(wallet != address(0), "zero address");
        require(sliqIdToWallet[sliqId] == address(0), "already registered");

        // Update mappings
        sliqIdToWallet[sliqId] = wallet;
        walletToSliqId[wallet] = sliqId;

        emit SliqIDRegistered(sliqId, wallet, block.timestamp);
    }
}
```

**Test Utilities**:
- `batchRegister()` - Setup multiple users at once
- `removeSliqID()` - Cleanup between tests
- `updateSliqID()` - Test wallet migration scenarios

**Example Test Setup**:
```solidity
// Setup test users
registry.registerSliqID("@alice", address(0x1));
registry.registerSliqID("@bob", address(0x2));
registry.registerSliqID("@charlie", address(0x3));

// Or batch setup
string[] memory ids = ["@alice", "@bob", "@charlie"];
address[] memory wallets = [address(0x1), address(0x2), address(0x3)];
registry.batchRegister(ids, wallets);
```

---

### MockFxOracle.sol

**Implementation Highlights**:

```solidity
contract MockFxOracle is IMockFxOracle {
    mapping(address => uint256) private tokenRates;

    function setRate(address token, uint256 rateInNGN) external override {
        require(rateInNGN > 0, "rate must be positive");
        uint256 oldRate = tokenRates[token];
        tokenRates[token] = rateInNGN;
        emit RateUpdated(token, oldRate, rateInNGN, block.timestamp);
    }

    function convertAmount(
        address fromToken,
        address toToken,
        uint256 amount
    ) external view override returns (uint256) {
        uint256 fromRate = tokenRates[fromToken];
        uint256 toRate = tokenRates[toToken];

        require(fromRate > 0 && toRate > 0, "token not supported");

        // Conversion: (amount * fromRate) / toRate
        return (amount * fromRate) / toRate;
    }
}
```

**Test Scenarios**:

```solidity
// Scenario 1: Equal rates (1:1 conversion)
oracle.setRate(usdt, 1500);
oracle.setRate(usdc, 1500);
uint256 result = oracle.convertAmount(usdt, usdc, 100 * 10**6);
// result = 100 USDC

// Scenario 2: Different rates (with exchange)
oracle.setRate(usdt, 1500);  // 1 USDT = ₦1,500
oracle.setRate(dai, 1485);   // 1 DAI = ₦1,485 (depegged)
uint256 result = oracle.convertAmount(usdt, dai, 100 * 10**18);
// result ≈ 101.01 DAI (user gets more DAI due to depeg)

// Scenario 3: Volatile asset
oracle.setRate(address(0), 5000);  // 1 ETH = ₦5,000
oracle.setRate(usdt, 1500);        // 1 USDT = ₦1,500
uint256 result = oracle.convertAmount(address(0), usdt, 1 ether);
// result ≈ 3,333 USDT (1 ETH worth of USDT)
```

---

### MockERC20.sol

**Implementation Highlights**:

```solidity
contract MockERC20 {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 value) external {
        totalSupply += value;
        balanceOf[to] += value;
        emit Transfer(address(0), to, value);
    }
}
```

**Creating Test Tokens**:

```solidity
// Create USDT (6 decimals like real USDT)
MockERC20 usdt = new MockERC20("Mock Tether", "mUSDT", 6);

// Create USDC (6 decimals)
MockERC20 usdc = new MockERC20("Mock USD Coin", "mUSDC", 6);

// Create DAI (18 decimals like real DAI)
MockERC20 dai = new MockERC20("Mock DAI", "mDAI", 18);

// Mint test tokens
usdt.mint(alice, 10_000 * 10**6);   // 10,000 USDT to Alice
usdc.mint(bob, 5_000 * 10**6);      // 5,000 USDC to Bob
dai.mint(charlie, 20_000 * 10**18); // 20,000 DAI to Charlie
```

**Why different decimals matter**:
```solidity
// USDT/USDC use 6 decimals
1 USDT = 1_000_000 (6 zeros)
100 USDT = 100_000_000

// DAI/ETH use 18 decimals
1 DAI = 1_000_000_000_000_000_000 (18 zeros)
100 DAI = 100_000_000_000_000_000_000

// Production TreasuryVault must handle decimal conversions!
```

---

## TreasuryVault Contract

### Overview

TreasuryVault is the central hub that combines four key functionalities:

1. **Smart Routing Layer**: Detects token type and routes payments
2. **Crypto Ledger Layer**: Maintains multi-token balances per SliqID
3. **Conversion Layer**: Handles cross-asset exchanges
4. **Admin & Security**: Manages withdrawals, pausing, and access control

### State Variables

```solidity
contract TreasuryVault {
    // External contract references
    ISliqIDRegistry public sliqIDRegistry;
    IMockFxOracle public fxOracle;

    // Multi-token ledger: SliqID => Token => Balance
    mapping(string => mapping(address => uint256)) public sliqBalances;

    // Address(0) represents native token (ETH/GLMR)
    address public constant NATIVE_TOKEN = address(0);

    // Access control
    address public owner;
    mapping(address => bool) public operators;

    // Emergency controls
    bool public paused;
}
```

### Architecture Diagram

```
TreasuryVault
├── Smart Routing Layer
│   ├── routePayment(sliqId, token, amount)
│   │   ├─> Validate sliqId exists
│   │   ├─> Transfer ERC20 from sender
│   │   ├─> Credit recipient's ledger
│   │   └─> Emit PaymentRouted event
│   │
│   └── routePaymentNative(sliqId)
│       ├─> Validate msg.value > 0
│       ├─> Receive native token
│       ├─> Credit recipient's ledger
│       └─> Emit PaymentRouted event
│
├── Crypto Ledger Layer
│   ├── creditSliqID(sliqId, token, amount)
│   │   └─> sliqBalances[sliqId][token] += amount
│   │
│   ├── debitSliqID(sliqId, token, amount)
│   │   ├─> Check sufficient balance
│   │   └─> sliqBalances[sliqId][token] -= amount
│   │
│   ├── getBalance(sliqId, token)
│   │   └─> return sliqBalances[sliqId][token]
│   │
│   └── getBalances(sliqId, tokens[])
│       └─> return array of balances
│
├── Conversion Layer
│   └── convertAsset(fromSliqId, toSliqId, fromToken, toToken, amount)
│       ├─> Validate both SliqIDs exist
│       ├─> Check sender has sufficient balance
│       ├─> Get conversion rate from Oracle
│       ├─> Debit sender's fromToken
│       ├─> Credit receiver's toToken
│       └─> Emit AssetConverted event
│
└── Admin & Security Layer
    ├── withdraw(token, amount, to)
    ├── pause() / unpause()
    ├── addOperator() / removeOperator()
    └── setSliqIDRegistry() / setFxOracle()
```

### Implementation Status

✅ **Completed:**
- Interfaces defined
- Mock contracts implemented
- Documentation created

🔄 **In Progress:**
- TreasuryVault.sol implementation (next)

⏳ **Pending:**
- Comprehensive test suite
- Deployment scripts
- On-chain verification

---

## Data Flow & Interactions

### Flow 1: Native Token Payment

```
User wants to send 1 ETH to @maryam

1. User calls: treasuryVault.routePaymentNative{value: 1 ether}("@maryam")

2. TreasuryVault validates:
   ├─> msg.value > 0 ✓
   ├─> sliqIDRegistry.resolveAddress("@maryam") != address(0) ✓
   └─> Contract not paused ✓

3. TreasuryVault credits ledger:
   └─> sliqBalances["@maryam"][address(0)] += 1 ether

4. Emit event:
   └─> PaymentRouted(msg.sender, "@maryam", address(0), 1 ether, block.timestamp)

5. Backend listens to event and updates database
```

### Flow 2: ERC20 Token Payment

```
User wants to send 1000 USDT to @john

1. User approves TreasuryVault:
   └─> usdt.approve(treasuryVault, 1000 * 10**6)

2. User calls:
   └─> treasuryVault.routePayment("@john", usdtAddress, 1000 * 10**6)

3. TreasuryVault validates:
   ├─> amount > 0 ✓
   ├─> sliqIDRegistry.resolveAddress("@john") != address(0) ✓
   ├─> user has approved >= amount ✓
   └─> Contract not paused ✓

4. TreasuryVault transfers tokens:
   └─> IERC20(usdt).transferFrom(msg.sender, address(this), amount)

5. TreasuryVault credits ledger:
   └─> sliqBalances["@john"][usdtAddress] += 1000 * 10**6

6. Emit event:
   └─> PaymentRouted(msg.sender, "@john", usdt, 1000*10**6, block.timestamp)
```

### Flow 3: Asset Conversion

```
@alice wants to convert 100 USDT to USDC and send to @bob

1. Operator calls:
   └─> treasuryVault.convertAsset("@alice", "@bob", usdt, usdc, 100*10**6)

2. TreasuryVault validates:
   ├─> msg.sender is operator ✓
   ├─> Both SliqIDs exist ✓
   ├─> sliqBalances["@alice"][usdt] >= 100*10**6 ✓
   ├─> Both tokens supported by oracle ✓
   └─> Contract not paused ✓

3. Get conversion rate:
   ├─> usdtRate = oracle.getRate(usdt)  // 1500
   └─> usdcRate = oracle.getRate(usdc)  // 1500

4. Calculate converted amount:
   └─> usdcAmount = (100*10**6 * 1500) / 1500 = 100*10**6

5. Update balances atomically:
   ├─> sliqBalances["@alice"][usdt] -= 100*10**6
   └─> sliqBalances["@bob"][usdc] += 100*10**6

6. Emit event:
   └─> AssetConverted("@alice", "@bob", usdt, usdc, 100*10**6, 100*10**6, 1500, timestamp)
```

### Flow 4: Balance Query

```
Frontend wants to display @maryam's balances

1. Get supported tokens:
   └─> tokens = [usdtAddr, usdcAddr, daiAddr, address(0)]

2. Batch query:
   └─> balances = treasuryVault.getBalances("@maryam", tokens)

3. Results:
   ├─> USDT: 1000 * 10**6
   ├─> USDC: 500 * 10**6
   ├─> DAI: 2000 * 10**18
   └─> ETH: 1.5 * 10**18

4. Format for display:
   ├─> USDT: 1,000.00
   ├─> USDC: 500.00
   ├─> DAI: 2,000.00
   └─> ETH: 1.5
```

---

## Security Considerations

### Access Control

```solidity
// Owner-only functions
modifier onlyOwner() {
    require(msg.sender == owner, "not owner");
    _;
}

// Operator-only functions (for conversions)
modifier onlyOperator() {
    require(operators[msg.sender] || msg.sender == owner, "not operator");
    _;
}
```

**Why separate operator role?**
- Owner: Full control (pause, withdraw, config changes)
- Operator: Limited to conversion operations
- Separation of concerns prevents over-privileged accounts

### Reentrancy Protection

```solidity
// Use OpenZeppelin's ReentrancyGuard
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract TreasuryVault is ReentrancyGuard {
    function routePayment(...) external nonReentrant {
        // Safe from reentrancy attacks
    }
}
```

**Attack scenario prevented**:
```solidity
// Malicious token's transferFrom could call back into routePayment
// Without nonReentrant, could drain contract or manipulate balances
```

### Emergency Controls

```solidity
// Pausable pattern
bool public paused;

modifier whenNotPaused() {
    require(!paused, "contract paused");
    _;
}

function pause() external onlyOwner {
    paused = true;
}

function unpause() external onlyOwner {
    paused = false;
}
```

**When to pause?**
- Security vulnerability discovered
- Oracle malfunction (bad rates)
- Suspicious activity detected
- Planned maintenance

### Input Validation

```solidity
function routePayment(string memory sliqId, address token, uint256 amount) external {
    // Validate inputs
    require(amount > 0, "zero amount");
    require(bytes(sliqId).length > 0, "empty SliqID");

    // Validate recipient exists
    address recipient = sliqIDRegistry.resolveAddress(sliqId);
    require(recipient != address(0), "recipient not found");

    // Proceed with transfer...
}
```

### Safe Token Transfers

```solidity
// Use OpenZeppelin's SafeERC20
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

using SafeERC20 for IERC20;

function routePayment(...) external {
    // Safe transfer (handles tokens that don't return bool)
    IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
}
```

**Why SafeERC20?**
- Some tokens don't return bool (USDT on mainnet)
- SafeERC20 handles these edge cases
- Prevents silent failures

---

## Testing Strategy

### Test Coverage Goals

| Component | Target | Critical Functions |
|-----------|--------|-------------------|
| Smart Routing | 100% | routePayment, routePaymentNative |
| Crypto Ledger | 100% | credit/debitSliqID, getBalance |
| Conversion | 100% | convertAsset, rate calculations |
| Admin Controls | 100% | withdraw, pause, access control |
| Overall | ≥90% | All public functions |

### Test Structure

```
test/
├── TreasuryVault.t.sol          # Main test suite
├── TreasuryVaultRouting.t.sol   # Routing tests
├── TreasuryVaultLedger.t.sol    # Ledger tests
├── TreasuryVaultConversion.t.sol # Conversion tests
└── TreasuryVaultAdmin.t.sol     # Admin tests
```

### Example Test (Foundry)

```solidity
// test/TreasuryVaultRouting.t.sol
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/TreasuryVault.sol";
import "../contracts/mocks/MockSliqIDRegistry.sol";
import "../contracts/mocks/MockERC20.sol";

contract TreasuryVaultRoutingTest is Test {
    TreasuryVault public vault;
    MockSliqIDRegistry public registry;
    MockERC20 public usdt;

    address public alice = address(0x1);
    address public bob = address(0x2);

    function setUp() public {
        // Deploy contracts
        registry = new MockSliqIDRegistry();
        vault = new TreasuryVault(address(registry), address(0));
        usdt = new MockERC20("Mock USDT", "mUSDT", 6);

        // Setup test users
        registry.registerSliqID("@alice", alice);
        registry.registerSliqID("@bob", bob);

        // Mint tokens
        usdt.mint(alice, 10_000 * 10**6);

        // Setup balances
        vm.deal(alice, 10 ether);
    }

    function testRouteNativePayment() public {
        // Arrange
        uint256 amount = 1 ether;

        // Act
        vm.prank(alice);
        vault.routePaymentNative{value: amount}("@bob");

        // Assert
        assertEq(vault.getBalance("@bob", address(0)), amount);
    }

    function testRouteERC20Payment() public {
        // Arrange
        uint256 amount = 1000 * 10**6;

        vm.startPrank(alice);
        usdt.approve(address(vault), amount);

        // Act
        vault.routePayment("@bob", address(usdt), amount);
        vm.stopPrank();

        // Assert
        assertEq(vault.getBalance("@bob", address(usdt)), amount);
    }

    function testRevertInvalidSliqID() public {
        // Expect revert
        vm.expectRevert("recipient not found");

        vm.prank(alice);
        vault.routePaymentNative{value: 1 ether}("@invalid");
    }
}
```

---

## Deployment Guide

### Prerequisites

1. **Environment Setup**:
```bash
# Install dependencies
forge install foundry-rs/forge-std --no-commit
forge install OpenZeppelin/openzeppelin-contracts --no-commit

# Configure .env
PRIVATE_KEY=your_private_key_without_0x
MOONBASE_RPC_URL=https://rpc.api.moonbase.moonbeam.network
MOONSCAN_API_KEY=your_moonscan_key
```

2. **Get DEV Tokens**:
- Visit: https://faucet.moonbeam.network/
- Connect wallet
- Request testnet DEV tokens

### Deployment Steps

#### Step 1: Deploy Mock Contracts

```bash
# Deploy MockSliqIDRegistry
forge create contracts/mocks/MockSliqIDRegistry.sol:MockSliqIDRegistry \
  --rpc-url moonbase \
  --private-key $PRIVATE_KEY

# Deploy MockFxOracle
forge create contracts/mocks/MockFxOracle.sol:MockFxOracle \
  --rpc-url moonbase \
  --private-key $PRIVATE_KEY

# Save addresses to .env
SLIQ_ID_REGISTRY_ADDRESS=0x...
MOCK_FX_ORACLE_ADDRESS=0x...
```

#### Step 2: Deploy TreasuryVault

```bash
# Deploy with constructor args
forge create contracts/TreasuryVault.sol:TreasuryVault \
  --rpc-url moonbase \
  --private-key $PRIVATE_KEY \
  --constructor-args $SLIQ_ID_REGISTRY_ADDRESS $MOCK_FX_ORACLE_ADDRESS

# Save address
TREASURY_VAULT_ADDRESS=0x...
```

#### Step 3: Verify Contracts

```bash
# Verify TreasuryVault
forge verify-contract \
  --chain-id 1287 \
  --compiler-version v0.8.20 \
  --constructor-args $(cast abi-encode "constructor(address,address)" $SLIQ_ID_REGISTRY_ADDRESS $MOCK_FX_ORACLE_ADDRESS) \
  $TREASURY_VAULT_ADDRESS \
  contracts/TreasuryVault.sol:TreasuryVault \
  --etherscan-api-key $MOONSCAN_API_KEY
```

#### Step 4: Configure Contracts

```bash
# Register test SliqIDs
cast send $SLIQ_ID_REGISTRY_ADDRESS \
  "registerSliqID(string,address)" "@alice" $ALICE_ADDRESS \
  --rpc-url moonbase \
  --private-key $PRIVATE_KEY

# Set token rates in oracle
cast send $MOCK_FX_ORACLE_ADDRESS \
  "setRate(address,uint256)" $USDT_ADDRESS 1500 \
  --rpc-url moonbase \
  --private-key $PRIVATE_KEY
```

---

## Front-End Integration Guide

This section explains how to integrate SliqPay smart contracts into your frontend application, written for developers with basic React/JavaScript knowledge.

---

## 🎯 CRITICAL: Contract Addresses & Integration Requirements

### **Network Information**
- **Network:** Moonbase Alpha (Testnet)
- **Chain ID:** 1287
- **RPC URL:** https://rpc.api.moonbase.moonbeam.network
- **Explorer:** https://moonbase.moonscan.io
- **Native Token:** DEV (for gas fees)

---

## 📋 Smart Contract Addresses - What Each One Does

### ✅ **REQUIRED FOR INTEGRATION** (Must implement these 3)

---

### 1️⃣ **MockSliqIDRegistry** (Identity System)

**Address:** `0xCB282e2Dc4dB94AFC3d04d7AE81444D13836FBF4`
**Status:** ✅ Deployed & Verified
**Explorer:** https://moonbase.moonscan.io/address/0xCB282e2Dc4dB94AFC3d04d7AE81444D13836FBF4

#### **What It Does:**
This is the **identity layer** of SliqPay. It maps human-readable usernames (SliqIDs like "alice") to blockchain wallet addresses (like 0x123...).

#### **Why It Exists:**
- Instead of sending money to `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`, users can send to "@alice"
- Makes crypto payments as easy as Venmo/CashApp
- Users don't need to memorize or copy/paste long addresses

#### **How It Works:**
- When a user signs up, they choose a SliqID (e.g., "john")
- The contract stores: `"john" => 0xUserWalletAddress`
- When someone sends payment to "john", the system looks up their wallet address
- One SliqID per wallet, one wallet per SliqID (1:1 mapping)

#### **Functions You MUST Integrate:**

| Function | When to Use | Required? |
|----------|-------------|-----------|
| `registerSliqID(string sliqId, address wallet)` | **User Registration:** When a new user signs up and wants to claim their username | ✅ REQUIRED |
| `isSliqIDRegistered(string sliqId)` | **Username Validation:** Before registration, check if username is available | ✅ REQUIRED |
| `resolveAddress(string sliqId)` | **Before Sending Payment:** Validate recipient exists before processing payment | ✅ REQUIRED |
| `getSliqIDByAddress(address wallet)` | **Display Username:** Show user's SliqID in dashboard/profile | ✅ REQUIRED |

#### **Frontend Integration Points:**
1. **Sign-Up Flow:** Call `registerSliqID()` after user connects wallet
2. **Send Payment Form:** Call `resolveAddress()` to validate recipient before sending
3. **User Dashboard:** Call `getSliqIDByAddress()` to display user's username
4. **Search/Autocomplete:** Call `isSliqIDRegistered()` for username availability checks

---

### 2️⃣ **TreasuryVault** (Payment Router & Balance Manager)

**Address:** `TBD_AFTER_DEPLOYMENT` ⏳
**Status:** Ready to deploy
**Explorer:** Will be available after deployment

#### **What It Does:**
This is the **core payment engine**. It:
1. Routes payments from sender to recipient (identified by SliqID)
2. Tracks balances for each user for each token
3. Handles both crypto tokens (USDT, USDC, DAI) and native tokens (DEV)
4. Manages approvals and transfers securely

#### **Why It Exists:**
- Central hub for all payments - all money flows through here
- Maintains an internal ledger of who owns what
- Prevents lost funds by validating recipients exist
- Simplifies token transfers (users don't interact with token contracts directly)

#### **How It Works:**
```
User wants to send 100 USDT to "bob"

1. User approves TreasuryVault to spend their USDT
2. User calls routePayment("bob", USDT_ADDRESS, 100)
3. TreasuryVault checks if "bob" exists in SliqIDRegistry
4. TreasuryVault transfers 100 USDT from user to itself
5. TreasuryVault credits bob's internal balance: bob.usdt += 100
6. Bob can now withdraw or spend their 100 USDT
```

#### **Functions You MUST Integrate:**

| Function | When to Use | Required? |
|----------|-------------|-----------|
| `routePayment(string recipientSliqId, address token, uint256 amount)` | **Send Token Payment:** When user sends USDT/USDC/DAI to someone | ✅ REQUIRED |
| `routePaymentNative(string recipientSliqId)` | **Send Native Token:** When user sends DEV tokens to someone | ✅ REQUIRED |
| `getBalance(string sliqId, address token)` | **Show Balance:** Display user's balance for a specific token | ✅ REQUIRED |
| `getBalances(string sliqId, address[] tokens)` | **Dashboard:** Get all balances at once (more efficient than individual calls) | ✅ REQUIRED |

#### **Optional Functions (Advanced Features):**

| Function | When to Use | Required? |
|----------|-------------|-----------|
| `convertAsset(...)` | **Token Swap:** Convert USDT to USDC, etc. (operator-only) | ⚠️ BACKEND ONLY |

#### **Frontend Integration Points:**
1. **Send Money Page:** Call `routePayment()` or `routePaymentNative()`
2. **Dashboard/Wallet:** Call `getBalances()` to show all token balances
3. **Transaction History:** Listen to `PaymentRouted` events
4. **Balance Updates:** Refresh balances after sending/receiving payments

---

### 3️⃣ **MockFxOracle** (Exchange Rate Provider)

**Address:** `0xeD3e610f22bd8cf6e9853978e758D0480e1D7A15`
**Status:** ✅ Deployed & Verified
**Explorer:** https://moonbase.moonscan.io/address/0xeD3e610f22bd8cf6e9853978e758D0480e1D7A15

#### **What It Does:**
Provides exchange rates for converting between different tokens. Stores rates in Nigerian Naira (NGN).

#### **Why It Exists:**
- Powers the conversion feature (USDT ↔ USDC ↔ DAI)
- Allows displaying fiat values (e.g., "100 USDT = ₦150,000")
- Enables cross-token payments (send USDT, recipient receives USDC)

#### **How It Works:**
```
Oracle stores: 1 USDT = ₦1,500
               1 USDC = ₦1,500
               1 DAI = ₦1,485

To convert 100 USDT to USDC:
= (100 USDT * ₦1,500) / ₦1,500
= 100 USDC

To show fiat value:
100 USDT * ₦1,500 = ₦150,000
```

#### **Functions You SHOULD Integrate:**

| Function | When to Use | Required? |
|----------|-------------|-----------|
| `getRate(address token)` | **Show Fiat Value:** Display "100 USDT ≈ ₦150,000" | ⚠️ OPTIONAL (Nice to have) |
| `convertAmount(address fromToken, address toToken, uint256 amount)` | **Preview Conversion:** Show "100 USDT = 100.5 USDC" | ⚠️ OPTIONAL |

#### **Frontend Integration Points:**
1. **Balance Display:** Show fiat equivalents next to crypto balances
2. **Conversion Preview:** Show estimated output before token swaps
3. **Price Updates:** Refresh rates periodically (every 5-10 minutes)

**⚠️ Note:** This is mainly for display purposes. The conversion logic is handled by backend operators.

---

### 📦 **Test Tokens** (For Testing Only)

These are mock ERC20 tokens deployed for testing SliqPay on testnet.

#### **MockUSDT (Mock Tether)**
**Address:** `0x209F293cd21F8DAFAF83518849734Af259C35a07`
**Decimals:** 6
**Symbol:** mUSDT

#### **MockUSDC (Mock USD Coin)**
**Address:** `0x50269d1A46B690e8c92C8cC877dBEe7B8B1a1CEd`
**Decimals:** 6
**Symbol:** mUSDC

#### **MockDAI (Mock DAI)**
**Address:** `0xA1b7Aad793601d9C6bcE03a2a2CD0B80eEE229b7`
**Decimals:** 18
**Symbol:** mDAI

#### **What They Do:**
Standard ERC20 tokens for testing payments. Users can mint unlimited tokens for free (testnet only).

#### **Functions You MUST Integrate:**

| Function | When to Use | Required? |
|----------|-------------|-----------|
| `approve(address spender, uint256 amount)` | **Before EVERY Token Payment:** Must approve TreasuryVault to spend user's tokens | ✅ REQUIRED |
| `balanceOf(address owner)` | **Wallet Balance:** Check how many tokens user has in their wallet (not in vault) | ✅ REQUIRED |
| `decimals()` | **Format Display:** Get decimal places for proper display (USDT = 6, DAI = 18) | ✅ REQUIRED |

#### **Frontend Integration Points:**
1. **Send Payment Flow:** Call `approve()` before `routePayment()`
2. **Wallet Display:** Show native wallet balance vs vault balance
3. **Amount Input:** Use `decimals()` to convert user input (100 USDT = 100000000 in contract)

---

## 🎯 CRITICAL: Which Contracts to Integrate (Priority Order)

### **Phase 1: Minimum Viable Product (MUST HAVE)**

These 3 contracts are **absolutely required** for basic functionality:

1. ✅ **SliqIDRegistry** - User registration and username lookup
2. ✅ **TreasuryVault** - Sending and receiving payments
3. ✅ **ERC20 Tokens (approve/balanceOf)** - Token interactions

**Without these, the app cannot function.**

---

### **Phase 2: Enhanced UX (SHOULD HAVE)**

4. ⚠️ **MockFxOracle** - Show fiat values (₦ display)

**This improves UX but app works without it.**

---

## 📱 Complete User Flows for Front-End Implementation

### **Flow 1: New User Signs Up** ⭐ CRITICAL PATH

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Connect Wallet Button                             │
│ ─────────────────────────────────────────────────────────── │
│ Frontend Action:                                           │
│ - Show "Connect Wallet" button                            │
│ - On click: Request MetaMask connection                   │
│                                                            │
│ Contracts Needed: NONE (just MetaMask)                    │
│                                                            │
│ Result: User's wallet address (0x123...)                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Check Network                                     │
│ ─────────────────────────────────────────────────────────── │
│ Frontend Action:                                           │
│ - Check if user is on Moonbase Alpha (chainId = 1287)    │
│ - If wrong network: Show "Switch Network" button          │
│ - Prompt to add Moonbase Alpha if not in MetaMask        │
│                                                            │
│ Contracts Needed: NONE                                    │
│                                                            │
│ Result: User on correct network                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Check If User Has SliqID                         │
│ ─────────────────────────────────────────────────────────── │
│ Frontend Action:                                           │
│ - Call: SliqIDRegistry.getSliqIDByAddress(userAddress)   │
│ - If returns empty string: User needs to register        │
│ - If returns SliqID: Proceed to dashboard                │
│                                                            │
│ Contract: ✅ SliqIDRegistry                               │
│ Function: getSliqIDByAddress(address) returns (string)   │
│                                                            │
│ Example Code:                                             │
│ const sliqId = await registryContract.getSliqIDByAddress(│
│   userAddress                                             │
│ );                                                        │
│ if (sliqId === "") {                                      │
│   // Show registration form                              │
│ } else {                                                  │
│   // Show dashboard                                       │
│ }                                                         │
│                                                            │
│ Result: Know if user needs to register                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Register SliqID (First-Time Users Only)          │
│ ─────────────────────────────────────────────────────────── │
│ Frontend Action:                                           │
│ 1. Show input field for desired SliqID                    │
│ 2. As user types, check availability:                     │
│    - Call: SliqIDRegistry.isSliqIDRegistered("alice")    │
│    - If false: Show "✓ Available"                        │
│    - If true: Show "✗ Taken"                             │
│                                                            │
│ 3. On submit:                                             │
│    - Call: SliqIDRegistry.registerSliqID(               │
│        "alice",                                           │
│        userAddress                                        │
│      )                                                    │
│    - Wait for transaction confirmation                   │
│    - Show success message                                │
│                                                            │
│ Contract: ✅ SliqIDRegistry                               │
│ Functions:                                                │
│ - isSliqIDRegistered(string) returns (bool)              │
│ - registerSliqID(string, address) [transaction]          │
│                                                            │
│ User Interaction:                                         │
│ - User sees MetaMask popup                               │
│ - User confirms transaction                               │
│ - Wait 6-12 seconds for confirmation                     │
│                                                            │
│ Result: User now has a SliqID                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: Show Dashboard                                    │
│ ─────────────────────────────────────────────────────────── │
│ Frontend Action:                                           │
│ - Display: "Welcome @alice"                               │
│ - Show balances (next flow explains this)                │
│ - Show Send/Receive buttons                              │
│                                                            │
│ Contracts Needed: See Flow 2 for balances                │
│                                                            │
│ Result: User sees their dashboard                         │
└─────────────────────────────────────────────────────────────┘
```

---

### **Flow 2: Display User Balances** ⭐ CRITICAL PATH

```
┌─────────────────────────────────────────────────────────────┐
│ Load User's Balances on Dashboard                         │
│ ─────────────────────────────────────────────────────────── │
│ Frontend Action:                                           │
│ 1. Get user's SliqID (from previous flow)                 │
│                                                            │
│ 2. Call: TreasuryVault.getBalances(                       │
│      "alice",                                             │
│      [USDT_ADDRESS, USDC_ADDRESS, DAI_ADDRESS, 0x0]      │
│    )                                                      │
│                                                            │
│ 3. Returns array: [100000000, 50000000, 0, 1000...]      │
│    (balances in smallest units)                           │
│                                                            │
│ 4. Format for display:                                    │
│    - USDT: 100000000 / 10^6 = 100.00 USDT               │
│    - USDC: 50000000 / 10^6 = 50.00 USDC                 │
│    - DAI: 0 / 10^18 = 0.00 DAI                          │
│    - DEV: 1000... / 10^18 = 0.001 DEV                   │
│                                                            │
│ Contract: ✅ TreasuryVault                                │
│ Function: getBalances(string, address[]) returns (uint[])│
│                                                            │
│ Display:                                                  │
│ ┌─────────────────────────┐                              │
│ │ Your Balances           │                              │
│ │ ──────────────────────  │                              │
│ │ USDT: 100.00            │                              │
│ │ USDC: 50.00             │                              │
│ │ DAI: 0.00               │                              │
│ │ DEV: 0.001              │                              │
│ │ ──────────────────────  │                              │
│ │ Total: ≈ ₦225,000       │ (Optional: from Oracle)     │
│ └─────────────────────────┘                              │
│                                                            │
│ Refresh: Every time user views dashboard or after sending│
└─────────────────────────────────────────────────────────────┘
```

---

### **Flow 3: Send Payment to Another User** ⭐ CRITICAL PATH

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: User Fills Send Form                              │
│ ─────────────────────────────────────────────────────────── │
│ Frontend UI:                                               │
│ ┌──────────────────────────┐                              │
│ │ Send To: [@bob         ] │ ← SliqID input               │
│ │ Amount:  [100          ] │ ← Amount                     │
│ │ Token:   [USDT ▼       ] │ ← Dropdown (USDT/USDC/DAI)  │
│ │                          │                               │
│ │ [Send Payment]           │                               │
│ └──────────────────────────┘                              │
│                                                            │
│ Validation (do these BEFORE submitting):                  │
│ ✓ Amount > 0                                              │
│ ✓ Recipient SliqID not empty                             │
│ ✓ User has enough balance                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Validate Recipient Exists                        │
│ ─────────────────────────────────────────────────────────── │
│ Frontend Action:                                           │
│ - Call: SliqIDRegistry.isSliqIDRegistered("bob")         │
│ - If false: Show error "User not found"                  │
│ - If true: Proceed to next step                          │
│                                                            │
│ Contract: ✅ SliqIDRegistry                               │
│ Function: isSliqIDRegistered(string) returns (bool)      │
│                                                            │
│ Example Code:                                             │
│ const exists = await registryContract.isSliqIDRegistered(│
│   "bob"                                                   │
│ );                                                        │
│ if (!exists) {                                            │
│   alert("Recipient not found");                          │
│   return;                                                 │
│ }                                                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3A: Convert Amount to Smallest Unit                 │
│ ─────────────────────────────────────────────────────────── │
│ Frontend Action:                                           │
│ - User entered: 100 USDT                                  │
│ - USDT has 6 decimals                                     │
│ - Convert: 100 * 10^6 = 100,000,000                      │
│                                                            │
│ Example Code:                                             │
│ const decimals = 6; // USDT/USDC = 6, DAI = 18           │
│ const amountInSmallestUnit = ethers.parseUnits(          │
│   "100",                                                  │
│   decimals                                                │
│ );                                                        │
│ // Result: 100000000                                      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3B: Approve Token Spending (TRANSACTION 1)          │
│ ─────────────────────────────────────────────────────────── │
│ Frontend Action:                                           │
│ 1. Get token contract:                                    │
│    const tokenContract = new ethers.Contract(            │
│      USDT_ADDRESS,                                        │
│      ERC20_ABI,                                           │
│      signer                                               │
│    );                                                     │
│                                                            │
│ 2. Call approve:                                          │
│    const approveTx = await tokenContract.approve(        │
│      TREASURY_VAULT_ADDRESS,                             │
│      amountInSmallestUnit                                │
│    );                                                     │
│                                                            │
│ 3. Wait for confirmation:                                 │
│    await approveTx.wait();                               │
│                                                            │
│ Contract: ✅ ERC20 Token (USDT/USDC/DAI)                 │
│ Function: approve(address spender, uint256 amount)       │
│                                                            │
│ User Sees:                                                │
│ - MetaMask popup #1: "Approve SliqPay to spend 100 USDT"│
│ - Loading spinner: "Approving..."                        │
│ - Success: "Approval confirmed"                          │
│                                                            │
│ ⚠️ CRITICAL: Must wait for this to complete before Step 4│
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Route Payment (TRANSACTION 2)                    │
│ ─────────────────────────────────────────────────────────── │
│ Frontend Action:                                           │
│ 1. Call: TreasuryVault.routePayment(                     │
│      "bob",              // recipient SliqID              │
│      USDT_ADDRESS,       // token                         │
│      100000000           // amount in smallest unit       │
│    )                                                      │
│                                                            │
│ 2. Wait for confirmation:                                 │
│    const receipt = await paymentTx.wait();               │
│                                                            │
│ 3. Show success with transaction hash:                   │
│    "Payment sent! TX: {receipt.hash}"                    │
│                                                            │
│ Contract: ✅ TreasuryVault                                │
│ Function: routePayment(string, address, uint256)         │
│                                                            │
│ User Sees:                                                │
│ - MetaMask popup #2: "Confirm transaction"               │
│ - Loading spinner: "Sending payment..."                  │
│ - Success message: "100 USDT sent to @bob!"              │
│ - Link to view on explorer                               │
│                                                            │
│ What Happens Behind the Scenes:                          │
│ - TreasuryVault pulls 100 USDT from sender               │
│ - Credits bob's internal balance: bob.usdt += 100        │
│ - Emits PaymentRouted event                              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: Update UI                                         │
│ ─────────────────────────────────────────────────────────── │
│ Frontend Action:                                           │
│ - Refresh sender's balance (they now have 100 less USDT) │
│ - Clear form inputs                                       │
│ - Show transaction in "Recent Activity"                  │
│ - Optionally notify bob (via backend)                    │
│                                                            │
│ What Bob Sees:                                            │
│ - (If he's online) Real-time notification                │
│ - His USDT balance increases by 100                      │
│ - Transaction shows in his activity feed                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚨 CRITICAL NOTES FOR FRONT-END DEVELOPER

### **1. Two-Transaction Process for Token Payments**

Every ERC20 payment requires **TWO separate transactions**:
- **Transaction 1:** Approve TreasuryVault to spend tokens
- **Transaction 2:** Call routePayment to actually send

**⚠️ You CANNOT skip the approval step!** The contract will fail without it.

### **2. Native Token Payments (DEV) Only Need ONE Transaction**

When sending DEV (native token):
- Call `routePaymentNative()` with `{value: amount}`
- NO approval needed
- Simpler and cheaper for users

### **3. Decimal Handling is CRITICAL**

Tokens have different decimal places:
- **USDT/USDC:** 6 decimals (1 USDT = 1,000,000)
- **DAI/DEV:** 18 decimals (1 DAI = 1,000,000,000,000,000,000)

**Always use `ethers.parseUnits()` and `ethers.formatUnits()`** to handle this correctly!

### **4. Always Validate Recipients Before Sending**

```javascript
// GOOD ✅
const exists = await registry.isSliqIDRegistered(recipient);
if (!exists) {
  return alert("User not found");
}
await sendPayment();

// BAD ❌ (Will fail and waste gas)
await sendPayment(); // No validation!
```

---

## Prerequisites

**What You Need:**
- Basic understanding of React/Next.js
- Node.js and npm installed
- MetaMask or similar Web3 wallet

**Install Required Packages:**
```bash
npm install ethers@^6.0.0
# or
npm install viem wagmi @rainbow-me/rainbowkit
```

This guide uses **ethers.js v6** (most popular and beginner-friendly).

---

### Contract Addresses (Moonbase Alpha Testnet)

```javascript
// config/contracts.js
export const CONTRACTS = {
  MockSliqIDRegistry: "0xCB282e2Dc4dB94AFC3d04d7AE81444D13836FBF4",
  MockFxOracle: "0xeD3e610f22bd8cf6e9853978e758D0480e1D7A15",
  TreasuryVault: "TBD_DEPLOY_FIRST", // Update after deployment
  MockUSDT: "0x209F293cd21F8DAFAF83518849734Af259C35a07",
  MockUSDC: "0x50269d1A46B690e8c92C8cC877dBEe7B8B1a1CEd",
  MockDAI: "0xA1b7Aad793601d9C6bcE03a2a2CD0B80eEE229b7",
};

export const RPC_URL = "https://rpc.api.moonbase.moonbeam.network";
export const CHAIN_ID = 1287; // Moonbase Alpha
export const EXPLORER_URL = "https://moonbase.moonscan.io";
```

---

### Contract ABIs (Application Binary Interfaces)

ABIs tell your frontend how to interact with smart contracts.

**Where to Get ABIs:**
1. From compiled contracts: `out/ContractName.sol/ContractName.json`
2. From Moonscan (after verification)
3. From the simplified ABIs below

**Simplified ABIs for Integration:**

```javascript
// config/abis.js

// Only include functions you actually use in your frontend
export const SLIQ_ID_REGISTRY_ABI = [
  "function registerSliqID(string memory sliqId, address wallet)",
  "function resolveAddress(string memory sliqId) view returns (address)",
  "function isSliqIDRegistered(string memory sliqId) view returns (bool)",
  "function getSliqIDByAddress(address wallet) view returns (string memory)",
  "event SliqIDRegistered(string indexed sliqId, address indexed wallet, uint256 timestamp)"
];

export const TREASURY_VAULT_ABI = [
  "function routePayment(string memory recipientSliqId, address token, uint256 amount)",
  "function routePaymentNative(string memory recipientSliqId) payable",
  "function getBalance(string memory sliqId, address token) view returns (uint256)",
  "function getBalances(string memory sliqId, address[] memory tokens) view returns (uint256[] memory)",
  "function convertAsset(string memory fromSliqId, string memory toSliqId, address fromToken, address toToken, uint256 amount)",
  "event PaymentRouted(address indexed sender, string indexed recipientSliqId, address indexed token, uint256 amount, uint256 timestamp)",
  "event BalanceUpdated(string indexed sliqId, address indexed token, uint256 newBalance, uint256 timestamp)"
];

export const MOCK_FX_ORACLE_ABI = [
  "function getRate(address token) view returns (uint256)",
  "function convertAmount(address fromToken, address toToken, uint256 amount) view returns (uint256)",
  "function isTokenSupported(address token) view returns (bool)"
];

export const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];
```

---

### Setting Up Web3 Connection

**Create a Web3 Provider Hook:**

```javascript
// hooks/useWeb3.js
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CHAIN_ID, RPC_URL } from '../config/contracts';

export function useWeb3() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  // Connect wallet
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error("Please install MetaMask!");
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      // Create provider and signer
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();

      setProvider(web3Provider);
      setSigner(web3Signer);
      setAddress(accounts[0]);
      setIsConnected(true);

      // Check if on correct network
      const network = await web3Provider.getNetwork();
      if (Number(network.chainId) !== CHAIN_ID) {
        await switchNetwork();
      }
    } catch (err) {
      setError(err.message);
      console.error("Connection error:", err);
    }
  };

  // Switch to Moonbase Alpha
  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }],
      });
    } catch (switchError) {
      // Chain not added, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${CHAIN_ID.toString(16)}`,
            chainName: 'Moonbase Alpha',
            nativeCurrency: {
              name: 'DEV',
              symbol: 'DEV',
              decimals: 18
            },
            rpcUrls: [RPC_URL],
            blockExplorerUrls: ['https://moonbase.moonscan.io/']
          }]
        });
      }
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setIsConnected(false);
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
        } else {
          disconnectWallet();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  return {
    provider,
    signer,
    address,
    isConnected,
    error,
    connectWallet,
    disconnectWallet,
    switchNetwork
  };
}
```

---

### Required Smart Contract Integrations

Your frontend needs to interact with these contracts:

#### 1. **MockSliqIDRegistry** (Identity System)

```javascript
// hooks/useSliqIDRegistry.js
import { ethers } from 'ethers';
import { CONTRACTS, RPC_URL } from '../config/contracts';
import { SLIQ_ID_REGISTRY_ABI } from '../config/abis';
import { useWeb3 } from './useWeb3';

export function useSliqIDRegistry() {
  const { signer, provider } = useWeb3();

  // Read-only contract (no wallet needed)
  const getReadContract = () => {
    const readProvider = new ethers.JsonRpcProvider(RPC_URL);
    return new ethers.Contract(
      CONTRACTS.MockSliqIDRegistry,
      SLIQ_ID_REGISTRY_ABI,
      readProvider
    );
  };

  // Write contract (requires wallet)
  const getWriteContract = () => {
    if (!signer) throw new Error("Wallet not connected");
    return new ethers.Contract(
      CONTRACTS.MockSliqIDRegistry,
      SLIQ_ID_REGISTRY_ABI,
      signer
    );
  };

  // Check if SliqID is available
  const isSliqIDAvailable = async (sliqId) => {
    try {
      const contract = getReadContract();
      const isRegistered = await contract.isSliqIDRegistered(sliqId);
      return !isRegistered; // Available if NOT registered
    } catch (error) {
      console.error("Error checking SliqID:", error);
      throw error;
    }
  };

  // Register a new SliqID
  const registerSliqID = async (sliqId, walletAddress) => {
    try {
      const contract = getWriteContract();
      const tx = await contract.registerSliqID(sliqId, walletAddress);

      console.log("Transaction sent:", tx.hash);
      const receipt = await tx.wait(); // Wait for confirmation
      console.log("SliqID registered successfully!");

      return receipt;
    } catch (error) {
      console.error("Error registering SliqID:", error);
      throw error;
    }
  };

  // Resolve SliqID to wallet address
  const resolveSliqID = async (sliqId) => {
    try {
      const contract = getReadContract();
      const address = await contract.resolveAddress(sliqId);

      if (address === ethers.ZeroAddress) {
        throw new Error("SliqID not found");
      }

      return address;
    } catch (error) {
      console.error("Error resolving SliqID:", error);
      throw error;
    }
  };

  // Get SliqID from wallet address (reverse lookup)
  const getSliqIDByAddress = async (walletAddress) => {
    try {
      const contract = getReadContract();
      const sliqId = await contract.getSliqIDByAddress(walletAddress);
      return sliqId;
    } catch (error) {
      console.error("Error getting SliqID:", error);
      throw error;
    }
  };

  return {
    isSliqIDAvailable,
    registerSliqID,
    resolveSliqID,
    getSliqIDByAddress
  };
}
```

**Example Usage in Component:**

```javascript
// components/RegisterSliqID.js
import { useState } from 'react';
import { useWeb3 } from '../hooks/useWeb3';
import { useSliqIDRegistry } from '../hooks/useSliqIDRegistry';

export function RegisterSliqID() {
  const { address, isConnected, connectWallet } = useWeb3();
  const { isSliqIDAvailable, registerSliqID } = useSliqIDRegistry();

  const [sliqId, setSliqId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError('');

      // Validate input
      if (!sliqId || sliqId.length < 3) {
        throw new Error("SliqID must be at least 3 characters");
      }

      // Check availability
      const available = await isSliqIDAvailable(sliqId);
      if (!available) {
        throw new Error("SliqID already taken");
      }

      // Register
      await registerSliqID(sliqId, address);
      setSuccess(true);
      setSliqId('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <button onClick={connectWallet}>
        Connect Wallet to Register SliqID
      </button>
    );
  }

  return (
    <div>
      <h2>Register Your SliqID</h2>
      <input
        type="text"
        value={sliqId}
        onChange={(e) => setSliqId(e.target.value)}
        placeholder="Enter your SliqID"
        disabled={loading}
      />
      <button onClick={handleRegister} disabled={loading}>
        {loading ? 'Registering...' : 'Register SliqID'}
      </button>

      {error && <p style={{color: 'red'}}>{error}</p>}
      {success && <p style={{color: 'green'}}>SliqID registered successfully!</p>}
    </div>
  );
}
```

#### 2. **TreasuryVault** (Payment Router)

```javascript
// hooks/useTreasuryVault.js
import { ethers } from 'ethers';
import { CONTRACTS, RPC_URL } from '../config/contracts';
import { TREASURY_VAULT_ABI, ERC20_ABI } from '../config/abis';
import { useWeb3 } from './useWeb3';

export function useTreasuryVault() {
  const { signer, provider } = useWeb3();

  const getReadContract = () => {
    const readProvider = new ethers.JsonRpcProvider(RPC_URL);
    return new ethers.Contract(
      CONTRACTS.TreasuryVault,
      TREASURY_VAULT_ABI,
      readProvider
    );
  };

  const getWriteContract = () => {
    if (!signer) throw new Error("Wallet not connected");
    return new ethers.Contract(
      CONTRACTS.TreasuryVault,
      TREASURY_VAULT_ABI,
      signer
    );
  };

  // Get user's balance for a specific token
  const getBalance = async (sliqId, tokenAddress) => {
    try {
      const contract = getReadContract();
      const balance = await contract.getBalance(sliqId, tokenAddress);
      return balance;
    } catch (error) {
      console.error("Error getting balance:", error);
      throw error;
    }
  };

  // Get user's balances for multiple tokens at once
  const getAllBalances = async (sliqId) => {
    try {
      const contract = getReadContract();
      const tokenAddresses = [
        CONTRACTS.MockUSDT,
        CONTRACTS.MockUSDC,
        CONTRACTS.MockDAI,
        ethers.ZeroAddress // Native token (DEV)
      ];

      const balances = await contract.getBalances(sliqId, tokenAddresses);

      // Format response
      return {
        usdt: balances[0],
        usdc: balances[1],
        dai: balances[2],
        native: balances[3]
      };
    } catch (error) {
      console.error("Error getting balances:", error);
      throw error;
    }
  };

  // Send ERC20 tokens to a SliqID
  const sendTokenPayment = async (recipientSliqId, tokenAddress, amount) => {
    try {
      const vaultContract = getWriteContract();
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

      // Step 1: Check user's token balance
      const userBalance = await tokenContract.balanceOf(await signer.getAddress());
      if (userBalance < amount) {
        throw new Error("Insufficient token balance");
      }

      // Step 2: Approve TreasuryVault to spend tokens
      console.log("Approving tokens...");
      const approveTx = await tokenContract.approve(CONTRACTS.TreasuryVault, amount);
      await approveTx.wait();
      console.log("Approval successful");

      // Step 3: Route payment
      console.log("Routing payment...");
      const paymentTx = await vaultContract.routePayment(
        recipientSliqId,
        tokenAddress,
        amount
      );
      const receipt = await paymentTx.wait();
      console.log("Payment successful!");

      return receipt;
    } catch (error) {
      console.error("Error sending payment:", error);
      throw error;
    }
  };

  // Send native tokens (DEV) to a SliqID
  const sendNativePayment = async (recipientSliqId, amount) => {
    try {
      const contract = getWriteContract();

      const tx = await contract.routePaymentNative(recipientSliqId, {
        value: amount // Amount in wei
      });

      const receipt = await tx.wait();
      console.log("Native payment successful!");

      return receipt;
    } catch (error) {
      console.error("Error sending native payment:", error);
      throw error;
    }
  };

  return {
    getBalance,
    getAllBalances,
    sendTokenPayment,
    sendNativePayment
  };
}
```

**Example Usage - Send Payment Component:**

```javascript
// components/SendPayment.js
import { useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../hooks/useWeb3';
import { useTreasuryVault } from '../hooks/useTreasuryVault';
import { CONTRACTS } from '../config/contracts';

export function SendPayment() {
  const { isConnected, connectWallet } = useWeb3();
  const { sendTokenPayment, sendNativePayment } = useTreasuryVault();

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState('USDT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');

  const tokenAddresses = {
    'USDT': CONTRACTS.MockUSDT,
    'USDC': CONTRACTS.MockUSDC,
    'DAI': CONTRACTS.MockDAI,
    'DEV': ethers.ZeroAddress
  };

  const tokenDecimals = {
    'USDT': 6,
    'USDC': 6,
    'DAI': 18,
    'DEV': 18
  };

  const handleSend = async () => {
    try {
      setLoading(true);
      setError('');
      setTxHash('');

      // Convert amount to wei/proper decimals
      const decimals = tokenDecimals[token];
      const amountInSmallestUnit = ethers.parseUnits(amount, decimals);

      let receipt;
      if (token === 'DEV') {
        // Send native token
        receipt = await sendNativePayment(recipient, amountInSmallestUnit);
      } else {
        // Send ERC20 token
        const tokenAddress = tokenAddresses[token];
        receipt = await sendTokenPayment(recipient, tokenAddress, amountInSmallestUnit);
      }

      setTxHash(receipt.hash);
      setAmount('');
      setRecipient('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return <button onClick={connectWallet}>Connect Wallet</button>;
  }

  return (
    <div>
      <h2>Send Payment</h2>

      <div>
        <label>Recipient SliqID:</label>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="alice"
          disabled={loading}
        />
      </div>

      <div>
        <label>Amount:</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          disabled={loading}
        />
      </div>

      <div>
        <label>Token:</label>
        <select value={token} onChange={(e) => setToken(e.target.value)} disabled={loading}>
          <option value="USDT">USDT</option>
          <option value="USDC">USDC</option>
          <option value="DAI">DAI</option>
          <option value="DEV">DEV (Native)</option>
        </select>
      </div>

      <button onClick={handleSend} disabled={loading || !recipient || !amount}>
        {loading ? 'Sending...' : `Send ${amount || '0'} ${token}`}
      </button>

      {error && <p style={{color: 'red'}}>{error}</p>}
      {txHash && (
        <p style={{color: 'green'}}>
          Success! <a href={`https://moonbase.moonscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
            View on Explorer
          </a>
        </p>
      )}
    </div>
  );
}
```

#### 3. **Display Balances Component**

```javascript
// components/UserBalances.js
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useTreasuryVault } from '../hooks/useTreasuryVault';
import { useSliqIDRegistry } from '../hooks/useSliqIDRegistry';
import { useWeb3 } from '../hooks/useWeb3';

export function UserBalances() {
  const { address, isConnected } = useWeb3();
  const { getAllBalances } = useTreasuryVault();
  const { getSliqIDByAddress } = useSliqIDRegistry();

  const [sliqId, setSliqId] = useState('');
  const [balances, setBalances] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      loadUserData();
    }
  }, [isConnected, address]);

  const loadUserData = async () => {
    try {
      setLoading(true);

      // Get user's SliqID
      const userSliqId = await getSliqIDByAddress(address);
      setSliqId(userSliqId);

      if (userSliqId) {
        // Get all balances
        const userBalances = await getAllBalances(userSliqId);
        setBalances(userBalances);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatBalance = (balance, decimals) => {
    return ethers.formatUnits(balance, decimals);
  };

  if (!isConnected) {
    return <p>Connect your wallet to view balances</p>;
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!sliqId) {
    return <p>No SliqID registered for this wallet</p>;
  }

  return (
    <div>
      <h2>Your Balances</h2>
      <p>SliqID: <strong>{sliqId}</strong></p>

      {balances && (
        <div>
          <div>
            <span>USDT:</span>
            <strong>{formatBalance(balances.usdt, 6)}</strong>
          </div>
          <div>
            <span>USDC:</span>
            <strong>{formatBalance(balances.usdc, 6)}</strong>
          </div>
          <div>
            <span>DAI:</span>
            <strong>{formatBalance(balances.dai, 18)}</strong>
          </div>
          <div>
            <span>DEV:</span>
            <strong>{formatBalance(balances.native, 18)}</strong>
          </div>
        </div>
      )}

      <button onClick={loadUserData}>Refresh Balances</button>
    </div>
  );
}
```

---

### Complete User Flow (Step-by-Step)

Here's how the entire system works from a user's perspective:

#### **Flow 1: New User Onboarding**

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: User Connects Wallet                               │
│ - User clicks "Connect Wallet" button                      │
│ - MetaMask popup appears                                   │
│ - User approves connection                                 │
│ - Frontend receives wallet address                         │
│ - Check if user is on Moonbase Alpha (chain ID 1287)      │
│ - If wrong network, prompt to switch                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Check if User Has SliqID                          │
│ - Frontend calls: getSliqIDByAddress(userAddress)         │
│ - If SliqID found: Show dashboard                         │
│ - If no SliqID: Show registration form                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Register SliqID (First-time users)                │
│ - User enters desired SliqID (e.g., "alice")              │
│ - Frontend checks: isSliqIDAvailable("alice")             │
│ - If available:                                           │
│   1. Call registerSliqID("alice", userAddress)            │
│   2. User signs transaction in MetaMask                   │
│   3. Wait for transaction confirmation                    │
│   4. Show success message                                 │
│   5. Redirect to dashboard                                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: User Dashboard                                    │
│ - Display user's SliqID                                   │
│ - Show all token balances (USDT, USDC, DAI, DEV)         │
│ - Show recent transactions                                │
│ - Options: Send payment, Receive, Convert tokens          │
└─────────────────────────────────────────────────────────────┘
```

#### **Flow 2: Sending a Payment**

```
┌─────────────────────────────────────────────────────────────┐
│ User wants to send 100 USDT to "bob"                      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: User Fills Send Form                              │
│ - Recipient SliqID: "bob"                                 │
│ - Amount: 100                                             │
│ - Token: USDT                                             │
│ - Clicks "Send"                                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Frontend Validations                              │
│ ✓ Check recipient exists: resolveSliqID("bob")           │
│ ✓ Check user has enough USDT                             │
│ ✓ Convert 100 to smallest unit: 100 * 10^6 = 100000000  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Token Approval (First Transaction)                │
│ - Frontend calls: usdt.approve(vaultAddress, amount)     │
│ - MetaMask popup: "Approve SliqPay to spend 100 USDT"    │
│ - User approves                                           │
│ - Wait for approval transaction to confirm                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Route Payment (Second Transaction)                │
│ - Frontend calls: vault.routePayment("bob", usdt, 100M)  │
│ - MetaMask popup: "Confirm transaction"                  │
│ - User confirms                                           │
│ - Wait for routing transaction to confirm                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: Smart Contract Processing                         │
│ - TreasuryVault validates recipient "bob" exists         │
│ - Transfers 100 USDT from user to vault                  │
│ - Credits bob's internal balance: +100 USDT              │
│ - Emits PaymentRouted event                              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: Frontend Updates                                  │
│ - Show success message with transaction hash             │
│ - Link to view on Moonscan                               │
│ - Refresh user's balance (now 100 USDT less)             │
│ - Optionally notify bob (via backend webhook)            │
└─────────────────────────────────────────────────────────────┘
```

#### **Flow 3: Receiving a Payment**

```
┌─────────────────────────────────────────────────────────────┐
│ Bob receives 100 USDT from Alice                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ BACKEND: Listen for PaymentRouted Events                  │
│ - Backend listens to TreasuryVault events                │
│ - Detects: PaymentRouted(alice, "bob", usdt, 100M, time) │
│ - Updates database with transaction                       │
│ - Sends notification to bob                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND: Bob Sees Updated Balance                        │
│ - Bob refreshes page or receives real-time update        │
│ - Frontend calls: getBalance("bob", usdtAddress)         │
│ - Shows new balance: 100 USDT                            │
│ - Shows notification: "You received 100 USDT from alice" │
└─────────────────────────────────────────────────────────────┘
```

---

### Event Listening (Real-time Updates)

To show payments in real-time without page refresh:

```javascript
// hooks/usePaymentEvents.js
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACTS, RPC_URL } from '../config/contracts';
import { TREASURY_VAULT_ABI } from '../config/abis';

export function usePaymentEvents(userSliqId) {
  const [newPayments, setNewPayments] = useState([]);

  useEffect(() => {
    if (!userSliqId) return;

    const provider = new ethers.WebSocketProvider('wss://wss.api.moonbase.moonbeam.network');
    const contract = new ethers.Contract(
      CONTRACTS.TreasuryVault,
      TREASURY_VAULT_ABI,
      provider
    );

    // Listen for payments to this user
    const filter = contract.filters.PaymentRouted(null, userSliqId);

    contract.on(filter, (sender, recipientSliqId, token, amount, timestamp, event) => {
      console.log("Payment received!", {
        from: sender,
        to: recipientSliqId,
        token,
        amount: amount.toString(),
        timestamp: timestamp.toString(),
        txHash: event.log.transactionHash
      });

      setNewPayments(prev => [...prev, {
        from: sender,
        amount: amount.toString(),
        token,
        timestamp: Number(timestamp),
        txHash: event.log.transactionHash
      }]);
    });

    // Cleanup
    return () => {
      contract.removeAllListeners();
      provider.destroy();
    };
  }, [userSliqId]);

  return newPayments;
}
```

**Usage:**
```javascript
function Dashboard() {
  const { sliqId } = useUser();
  const newPayments = usePaymentEvents(sliqId);

  useEffect(() => {
    if (newPayments.length > 0) {
      const latest = newPayments[newPayments.length - 1];
      showNotification(`You received payment! TX: ${latest.txHash}`);
      refreshBalances(); // Refresh to show updated balance
    }
  }, [newPayments]);

  return <div>...</div>;
}
```

---

### Error Handling Best Practices

```javascript
// utils/errorHandler.js
export function handleContractError(error) {
  // User rejected transaction
  if (error.code === 'ACTION_REJECTED') {
    return "Transaction cancelled by user";
  }

  // Insufficient funds
  if (error.message.includes('insufficient funds')) {
    return "Insufficient funds for transaction";
  }

  // Contract revert errors
  if (error.reason) {
    return `Transaction failed: ${error.reason}`;
  }

  // Network errors
  if (error.code === 'NETWORK_ERROR') {
    return "Network error. Please check your connection";
  }

  // Generic error
  return error.message || "An unexpected error occurred";
}
```

**Usage:**
```javascript
try {
  await sendTokenPayment(recipient, token, amount);
} catch (error) {
  const friendlyMessage = handleContractError(error);
  setError(friendlyMessage);
}
```

---

### Testing Your Integration

**1. Get Test Tokens:**
```bash
# Get DEV from faucet
Visit: https://faucet.moonbeam.network/

# Mint test ERC20 tokens (if you have access)
cast send USDT_ADDRESS "mint(address,uint256)" YOUR_ADDRESS 1000000000 \
  --rpc-url https://rpc.api.moonbase.moonbeam.network \
  --private-key YOUR_KEY
```

**2. Test Checklist:**
- [ ] Connect wallet successfully
- [ ] Switch to Moonbase Alpha network
- [ ] Register a SliqID
- [ ] View balances (should be 0 initially)
- [ ] Receive test tokens
- [ ] Send payment to another SliqID
- [ ] Check balance updates after payment
- [ ] Test error scenarios (invalid SliqID, insufficient balance)
- [ ] Verify transactions on Moonscan

---

### Common Issues & Solutions

**Issue 1: "Transaction Failed" with no clear reason**
- Check you're on the correct network (Moonbase Alpha, chain ID 1287)
- Ensure contract addresses are correct
- Verify recipient SliqID is registered

**Issue 2: "Insufficient Allowance"**
- Make sure approval transaction completed before payment
- Check approval amount is sufficient

**Issue 3: Balances not updating**
- Wait for transaction confirmation (usually 6-12 seconds)
- Refresh data after transaction completes
- Check you're querying the correct SliqID

**Issue 4: Events not firing**
- Use WebSocket provider for real-time events
- Fallback to polling `getBalance()` every 10-30 seconds

---

### Next Steps

- [ ] Complete TreasuryVault deployment
- [ ] Test all contract interactions
- [ ] Add transaction history display
- [ ] Implement withdrawal feature
- [ ] Add token conversion feature
- [ ] Set up backend event listener
- [ ] Create user notification system
- [ ] Add transaction status tracking
- [ ] Implement proper error boundaries
- [ ] Add loading states for better UX

---

**Document Version**: 2.0
**Last Updated**: 2025-11-12
**Status**: Living Document (Updated as contracts are deployed)
**Author**: SliqPay Development Team

---

*This documentation will be continuously updated as we complete deployment and add new features.*
