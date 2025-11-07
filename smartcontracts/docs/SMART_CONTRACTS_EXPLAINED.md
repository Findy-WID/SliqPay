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

## Next Steps

- [ ] Complete TreasuryVault.sol implementation
- [ ] Write comprehensive test suite
- [ ] Run security audit checklist
- [ ] Deploy to Moonbase Alpha
- [ ] Verify all contracts on Moonscan
- [ ] Integration testing with backend
- [ ] Frontend integration guide

---

**Document Version**: 1.0
**Last Updated**: 2025-11-07
**Status**: Living Document (Updated as contracts are built)
**Author**: SliqPay Development Team

---

*This documentation will be continuously updated as we implement the TreasuryVault contract and additional features.*
