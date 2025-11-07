# Foundry Setup Guide for TreasuryVault.sol

## Prerequisites

- Foundry installed ✅ (already on your system)
- MetaMask wallet with Moonbase Alpha configured
- DEV tokens from faucet: https://faucet.moonbeam.network/

---

## 🚀 Quick Start

### 1. Install Dependencies

Due to network connectivity, you may need to install dependencies when you have a stable connection:

```bash
cd smartcontracts

# Install forge-std (Foundry's standard library)
forge install foundry-rs/forge-std --no-commit

# Install OpenZeppelin contracts
forge install OpenZeppelin/openzeppelin-contracts --no-commit
```

**Alternative if network issues persist:**
```bash
# Clone manually into lib/
cd lib
git clone https://github.com/foundry-rs/forge-std
git clone https://github.com/OpenZeppelin/openzeppelin-contracts
cd ..
```

### 2. Set Up Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your private key (WITHOUT 0x prefix)
nano .env
```

Your `.env` should look like:
```bash
PRIVATE_KEY=your_actual_private_key_here_no_0x
MOONBASE_RPC_URL=https://rpc.api.moonbase.moonbeam.network
MOONSCAN_API_KEY=optional_for_verification
```

### 3. Verify Setup

```bash
# Check Foundry installation
forge --version

# Build contracts (once you have contracts)
forge build

# Run tests (once you have tests)
forge test

# Check formatting
forge fmt --check
```

---

## 📁 Project Structure

```
smartcontracts/
├── contracts/              # Solidity contracts
│   ├── TreasuryVault.sol
│   ├── interfaces/
│   │   ├── ISliqIDRegistry.sol
│   │   └── IMockFxOracle.sol
│   └── mocks/
│       ├── MockSliqIDRegistry.sol
│       ├── MockFxOracle.sol
│       └── MockERC20.sol
├── test/                   # Foundry tests (Solidity)
│   ├── TreasuryVault.t.sol
│   ├── TreasuryVaultRouting.t.sol
│   ├── TreasuryVaultLedger.t.sol
│   └── TreasuryVaultAdmin.t.sol
├── script/                 # Deployment scripts
│   ├── DeployMocks.s.sol
│   ├── DeployTreasury.s.sol
│   └── helpers/
├── lib/                    # Dependencies (forge-std, OZ)
├── foundry.toml           # Foundry configuration
├── remappings.txt         # Import path remappings
└── .env                   # Environment variables (DO NOT COMMIT)
```

---

## 🔧 Common Foundry Commands

### Building
```bash
# Compile contracts
forge build

# Compile with size optimization
forge build --sizes

# Compile and show detailed output
forge build --force
```

### Testing
```bash
# Run all tests
forge test

# Run tests with gas reports
forge test --gas-report

# Run specific test file
forge test --match-path test/TreasuryVault.t.sol

# Run specific test function
forge test --match-test testRoutePayment

# Run tests with verbosity (see console.log output)
forge test -vvv

# Run tests with trace (for debugging)
forge test -vvvv
```

### Deployment
```bash
# Deploy to Moonbase Alpha (dry run)
forge script script/DeployTreasury.s.sol --rpc-url moonbase

# Deploy to Moonbase Alpha (actual deployment)
forge script script/DeployTreasury.s.sol \
  --rpc-url moonbase \
  --broadcast \
  --verify

# Deploy with explicit private key
forge script script/DeployTreasury.s.sol \
  --rpc-url $MOONBASE_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
```

### Verification
```bash
# Verify contract on Moonscan
forge verify-contract \
  --chain-id 1287 \
  --compiler-version v0.8.20+commit.a1b79de6 \
  --constructor-args $(cast abi-encode "constructor(address)" "0x...") \
  0xYourContractAddress \
  contracts/TreasuryVault.sol:TreasuryVault \
  --etherscan-api-key $MOONSCAN_API_KEY
```

### Interaction
```bash
# Call a read function
cast call 0xContractAddress "getBalance(string,address)(uint256)" "@user" "0xToken" --rpc-url moonbase

# Send a transaction
cast send 0xContractAddress \
  "routePayment(string,address,uint256)" \
  "@recipient" "0xToken" "1000000" \
  --rpc-url moonbase \
  --private-key $PRIVATE_KEY

# Get transaction receipt
cast receipt 0xTxHash --rpc-url moonbase

# Get logs for an event
cast logs --address 0xContract "PaymentRouted(address,string,address,uint256,uint256)" --rpc-url moonbase
```

### Utilities
```bash
# Format all Solidity files
forge fmt

# Generate gas snapshots
forge snapshot

# Check coverage
forge coverage

# Generate documentation
forge doc

# Flatten a contract (for manual verification)
forge flatten contracts/TreasuryVault.sol
```

---

## 🌐 Moonbase Alpha Network Details

| Property | Value |
|----------|-------|
| Network Name | Moonbase Alpha |
| Chain ID | 1287 |
| RPC URL | https://rpc.api.moonbase.moonbeam.network |
| Currency | DEV |
| Block Explorer | https://moonbase.moonscan.io |
| Faucet | https://faucet.moonbeam.network |

---

## 📝 Testing with Foundry

Foundry uses Solidity for tests, making them faster and more integrated with your contracts.

### Test Structure
```solidity
// test/TreasuryVault.t.sol
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/TreasuryVault.sol";

contract TreasuryVaultTest is Test {
    TreasuryVault public vault;
    address public alice = address(0x1);

    function setUp() public {
        // Deploy contract
        vault = new TreasuryVault();

        // Setup test environment
        vm.deal(alice, 10 ether);
    }

    function testRoutePayment() public {
        // Arrange
        vm.prank(alice);

        // Act
        vault.routePaymentNative{value: 1 ether}("@bob");

        // Assert
        assertEq(vault.getBalance("@bob", address(0)), 1 ether);
    }
}
```

### Foundry Cheatcodes (vm.*) - Super Powerful!
```solidity
// Time manipulation
vm.warp(block.timestamp + 1 days);

// Caller impersonation
vm.prank(alice);  // Next call from alice
vm.startPrank(alice);  // All calls from alice until stopPrank()

// Balance manipulation
vm.deal(alice, 100 ether);

// Expect events
vm.expectEmit(true, true, false, true);
emit PaymentRouted(alice, "@bob", token, 1000, block.timestamp);

// Expect reverts
vm.expectRevert("Invalid SliqID");
vault.routePayment("", token, 1000);

// Storage manipulation
vm.store(address(vault), bytes32(slot), bytes32(value));
```

---

## 🛡️ Security Testing

### Test Coverage
```bash
# Generate coverage report
forge coverage

# Generate detailed HTML report
forge coverage --report lcov
genhtml lcov.info -o coverage/
```

### Gas Profiling
```bash
# Gas report for all tests
forge test --gas-report

# Snapshot gas usage
forge snapshot

# Compare gas snapshots
forge snapshot --diff
```

### Fuzz Testing
```bash
# Foundry automatically fuzzes test inputs
function testRouteFuzz(uint256 amount) public {
    vm.assume(amount > 0 && amount < type(uint128).max);
    vault.routePayment("@user", token, amount);
}

# Run with more fuzz runs (configured in foundry.toml)
forge test --fuzz-runs 10000
```

---

## 🚨 Common Issues & Solutions

### Issue: "Failed to resolve imports"
**Solution:**
```bash
# Reinstall dependencies
forge install --force

# Or check remappings
forge remappings
```

### Issue: "Stack too deep"
**Solution:**
```toml
# In foundry.toml, enable via-ir
via_ir = true
```

### Issue: "Out of gas"
**Solution:**
```bash
# Increase gas limit in test
function setUp() public {
    vm.txGasPrice(100 gwei);
}
```

### Issue: "Failed to verify contract"
**Solution:**
```bash
# Use forge verify-contract with constructor args
forge verify-contract --constructor-args $(cast abi-encode "constructor(address)" "0x...") ...
```

---

## 📚 Resources

- **Foundry Book:** https://book.getfoundry.sh/
- **Foundry Cheatcodes:** https://book.getfoundry.sh/cheatcodes/
- **OpenZeppelin Docs:** https://docs.openzeppelin.com/contracts/
- **Moonbeam Docs:** https://docs.moonbeam.network/
- **Moonscan (Testnet):** https://moonbase.moonscan.io/

---

## ✅ Pre-Deployment Checklist

- [ ] Dependencies installed (`forge-std`, `openzeppelin-contracts`)
- [ ] `.env` file configured with private key
- [ ] Contracts compile successfully (`forge build`)
- [ ] All tests pass (`forge test`)
- [ ] Test coverage ≥ 90% (`forge coverage`)
- [ ] Gas optimization reviewed (`forge test --gas-report`)
- [ ] Contract formatted (`forge fmt`)
- [ ] Security audit completed
- [ ] DEV tokens in wallet for deployment

---

**Next Steps:**
1. Install dependencies (when network is stable)
2. Create interface contracts
3. Create mock contracts
4. Implement TreasuryVault.sol
5. Write comprehensive tests
6. Deploy to Moonbase Alpha
7. Verify on Moonscan

---

**Status:** Ready for Development 🚀
**Framework:** Foundry
**Network:** Moonbase Alpha (Chain ID: 1287)
