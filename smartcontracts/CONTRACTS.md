# SliqPay Smart Contracts - Complete Reference

## Deployment Information

**Network:** Moonbase Alpha Testnet
**Chain ID:** 1287
**RPC URL:** https://rpc.api.moonbase.moonbeam.network
**Explorer:** https://moonbase.moonscan.io
**Deployer Address:** 0x536975e9E6af75045c1a03cCf1CD8B9590E2cB7f
**Deployment Date:** November 10, 2025

## Successfully Deployed Contracts

### MockFxOracle (Exchange Rate Provider)
- **Address:** 0xeD3e610f22bd8cf6e9853978e758D0480e1D7A15
- **Transaction:** 0x059c194e3a327e1828f8e3cd2675e64e3417ac647a8e021979b1ae82048c2c49
- **Explorer:** https://moonbase.moonscan.io/address/0xeD3e610f22bd8cf6e9853978e758D0480e1D7A15
- **Status:** Deployed and verified
- **Purpose:** Provides token-to-NGN exchange rates for conversions

## Remaining Contracts to Deploy

Run these commands in order to complete deployment:

```bash
# Set environment variables
export PRIVATE_KEY=bf62765e5bebad9bdd5f5b3dab8e51d9e2460c4f490eebafb254b2351bbff349
export RPC=https://rpc.api.moonbase.moonbeam.network

# 1. MockSliqIDRegistry (Identity System)
forge create contracts/mocks/MockSliqIDRegistry.sol:MockSliqIDRegistry \
  --rpc-url $RPC --private-key 0x$PRIVATE_KEY --legacy
# Save the deployed address

# 2. TreasuryVault (Main Payment Router)
# Replace REGISTRY_ADDRESS with address from step 1
forge create contracts/TreasuryVault.sol:TreasuryVault \
  --rpc-url $RPC --private-key 0x$PRIVATE_KEY \
  --constructor-args REGISTRY_ADDRESS 0xeD3e610f22bd8cf6e9853978e758D0480e1D7A15 \
  --legacy
# Save the deployed address

# 3. MockUSDT (Test Token, 6 decimals)
forge create contracts/mocks/MockERC20.sol:MockERC20 \
  --rpc-url $RPC --private-key 0x$PRIVATE_KEY \
  --constructor-args "Mock Tether" "mUSDT" 6 --legacy

# 4. MockUSDC (Test Token, 6 decimals)
forge create contracts/mocks/MockERC20.sol:MockERC20 \
  --rpc-url $RPC --private-key 0x$PRIVATE_KEY \
  --constructor-args "Mock USD Coin" "mUSDC" 6 --legacy

# 5. MockDAI (Test Token, 18 decimals)
forge create contracts/mocks/MockERC20.sol:MockERC20 \
  --rpc-url $RPC --private-key 0x$PRIVATE_KEY \
  --constructor-args "Mock DAI" "mDAI" 18 --legacy
```

---

## What This System Does

SliqPay is a payment routing system that lets users send cryptocurrency using simple usernames instead of wallet addresses.

**Core Functionality:**
- Register a username (SliqID) like "@alice" linked to your wallet
- Send payments to "@alice" instead of "0x1234...5678"
- Support for multiple tokens: USDT, USDC, DAI, and native DEV
- Track balances internally per user per token
- Convert between different tokens using exchange rates
- Secure with reentrancy protection and emergency pause

**Payment Flow:**
1. User registers SliqID → wallet mapping in MockSliqIDRegistry
2. Sender approves tokens and calls TreasuryVault.routePayment("@alice", token, amount)
3. TreasuryVault validates recipient exists and credits their internal balance
4. Recipient can withdraw or convert between tokens

---

## Quick Interaction Guide

### Working with MockFxOracle (Currently Deployed)

**Get Exchange Rate:**
```bash
cast call 0xeD3e610f22bd8cf6e9853978e758D0480e1D7A15 \
  "getRate(address)(uint256)" TOKEN_ADDRESS \
  --rpc-url https://rpc.api.moonbase.moonbeam.network
```

**Set Exchange Rate (Owner Only):**
```bash
cast send 0xeD3e610f22bd8cf6e9853978e758D0480e1D7A15 \
  "setRate(address,uint256)" TOKEN_ADDRESS 1500 \
  --rpc-url https://rpc.api.moonbase.moonbeam.network \
  --private-key 0xbf62765e5bebad9bdd5f5b3dab8e51d9e2460c4f490eebafb254b2351bbff349 \
  --legacy
```

**Check if Token Supported:**
```bash
cast call 0xeD3e610f22bd8cf6e9853978e758D0480e1D7A15 \
  "isTokenSupported(address)(bool)" TOKEN_ADDRESS \
  --rpc-url https://rpc.api.moonbase.moonbeam.network
```

**Convert Amount Between Tokens:**
```bash
cast call 0xeD3e610f22bd8cf6e9853978e758D0480e1D7A15 \
  "convertAmount(address,address,uint256)(uint256)" \
  FROM_TOKEN TO_TOKEN AMOUNT \
  --rpc-url https://rpc.api.moonbase.moonbeam.network
```

### Working with MockSliqIDRegistry (Once Deployed)

**Register SliqID:**
```bash
cast send REGISTRY_ADDRESS \
  "registerSliqID(string,address)" "your_username" YOUR_WALLET \
  --rpc-url https://rpc.api.moonbase.moonbeam.network \
  --private-key 0xYOUR_PRIVATE_KEY --legacy
```

**Check if Registered:**
```bash
cast call REGISTRY_ADDRESS \
  "isSliqIDRegistered(string)(bool)" "username" \
  --rpc-url https://rpc.api.moonbase.moonbeam.network
```

**Resolve to Address:**
```bash
cast call REGISTRY_ADDRESS \
  "resolveAddress(string)(address)" "username" \
  --rpc-url https://rpc.api.moonbase.moonbeam.network
```

**Update SliqID:**
```bash
cast send REGISTRY_ADDRESS \
  "updateSliqID(string,address)" "username" NEW_WALLET_ADDRESS \
  --rpc-url https://rpc.api.moonbase.moonbeam.network \
  --private-key 0xOWNER_PRIVATE_KEY --legacy
```

### Working with TreasuryVault (Once Deployed)

**Route ERC20 Payment:**
```bash
# 1. Approve vault
cast send TOKEN_ADDRESS \
  "approve(address,uint256)" VAULT_ADDRESS AMOUNT \
  --rpc-url https://rpc.api.moonbase.moonbeam.network \
  --private-key 0xYOUR_PRIVATE_KEY --legacy

# 2. Send payment
cast send VAULT_ADDRESS \
  "routePayment(string,address,uint256)" "recipient_username" TOKEN_ADDRESS AMOUNT \
  --rpc-url https://rpc.api.moonbase.moonbeam.network \
  --private-key 0xYOUR_PRIVATE_KEY --legacy
```

**Route Native Payment:**
```bash
cast send VAULT_ADDRESS \
  "routePaymentNative(string)" "recipient_username" \
  --value 0.1ether \
  --rpc-url https://rpc.api.moonbase.moonbeam.network \
  --private-key 0xYOUR_PRIVATE_KEY --legacy
```

**Check Balance:**
```bash
cast call VAULT_ADDRESS \
  "getBalance(string,address)(uint256)" "username" TOKEN_ADDRESS \
  --rpc-url https://rpc.api.moonbase.moonbeam.network
```

**Convert Assets (Operator Only):**
```bash
cast send VAULT_ADDRESS \
  "convertAsset(string,string,address,address,uint256)" \
  "username" "username" FROM_TOKEN TO_TOKEN AMOUNT \
  --rpc-url https://rpc.api.moonbase.moonbeam.network \
  --private-key 0xOPERATOR_PRIVATE_KEY --legacy
```

---

## JavaScript Integration Example

```javascript
const { ethers } = require('ethers');

const provider = new ethers.providers.JsonRpcProvider('https://rpc.api.moonbase.moonbeam.network');
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Oracle contract (deployed)
const oracle = new ethers.Contract(
  '0xeD3e610f22bd8cf6e9853978e758D0480e1D7A15',
  ORACLE_ABI,
  wallet
);

// Get rate
async function getTokenRate(tokenAddress) {
  const rate = await oracle.getRate(tokenAddress);
  return rate.toString();
}

// Set rate (owner only)
async function setTokenRate(tokenAddress, rateInNGN) {
  const tx = await oracle.setRate(tokenAddress, rateInNGN);
  return await tx.wait();
}

// Once registry is deployed
const registry = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, wallet);

async function registerUser(sliqId, walletAddress) {
  const tx = await registry.registerSliqID(sliqId, walletAddress);
  return await tx.wait();
}

async function resolveUser(sliqId) {
  return await registry.resolveAddress(sliqId);
}

// Once vault is deployed
const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, wallet);

async function sendPayment(recipientSliqId, tokenAddress, amount) {
  // Approve
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
  const approveTx = await token.approve(VAULT_ADDRESS, amount);
  await approveTx.wait();

  // Send
  const tx = await vault.routePayment(recipientSliqId, tokenAddress, amount);
  return await tx.wait();
}
```

---

## Contract Verification

Verify on Moonscan after deployment:

```bash
forge verify-contract \
  --chain-id 1287 \
  --compiler-version v0.8.20 \
  CONTRACT_ADDRESS \
  contracts/PATH:CONTRACT_NAME \
  --watch
```

Example for MockFxOracle:
```bash
forge verify-contract \
  --chain-id 1287 \
  --compiler-version v0.8.20 \
  0xeD3e610f22bd8cf6e9853978e758D0480e1D7A15 \
  contracts/mocks/MockFxOracle.sol:MockFxOracle \
  --watch
```

---

## Security & Access Control

**Roles:**
- **Owner:** Full control - pause, unpause, add/remove operators, update settings, withdraw
- **Operator:** Can perform asset conversions only
- **User:** Can register SliqIDs, route payments, query balances

**Security Features:**
- Reentrancy protection on all state-changing functions
- Pausable emergency stop mechanism
- Input validation (non-zero amounts, valid addresses, registered SliqIDs)
- Event emission for complete audit trail

**Best Practices:**
- Always approve exact token amounts, never unlimited
- Verify SliqID exists before sending payments
- Check balances before withdrawals
- Use multi-sig wallet for owner role in production
- Monitor oracle rate updates and set limits

---

## Getting Testnet Tokens

1. Visit Moonbeam Faucet: https://faucet.moonbeam.network/
2. Enter your address: 0x536975e9E6af75045c1a03cCf1CD8B9590E2cB7f
3. Receive DEV tokens for gas fees
4. Once mock tokens deployed, mint test tokens:

```bash
# Mint USDT (6 decimals, 10,000 tokens)
cast send USDT_ADDRESS "mint(address,uint256)" YOUR_ADDRESS 10000000000 \
  --rpc-url https://rpc.api.moonbase.moonbeam.network \
  --private-key 0xYOUR_PRIVATE_KEY --legacy

# Mint USDC (6 decimals, 10,000 tokens)
cast send USDC_ADDRESS "mint(address,uint256)" YOUR_ADDRESS 10000000000 \
  --rpc-url https://rpc.api.moonbase.moonbeam.network \
  --private-key 0xYOUR_PRIVATE_KEY --legacy

# Mint DAI (18 decimals, 10,000 tokens)
cast send DAI_ADDRESS "mint(address,uint256)" YOUR_ADDRESS 10000000000000000000000 \
  --rpc-url https://rpc.api.moonbase.moonbeam.network \
  --private-key 0xYOUR_PRIVATE_KEY --legacy
```

---

## Technical Details

**Compiler:** Solidity 0.8.20
**Framework:** Foundry
**Total Contract Code:** 2,131 lines
**Documentation:** 100% NatSpec coverage

**Contract Files:**
- TreasuryVault.sol - 1,072 lines (main payment router)
- MockSliqIDRegistry.sol - 259 lines (identity system)
- MockFxOracle.sol - 290 lines (exchange rates)
- MockERC20.sol - 282 lines (test tokens)
- Interfaces - 228 lines

**Build & Test:**
```bash
# Compile contracts
forge build

# Run tests (when written)
forge test

# Check coverage
forge coverage
```

**ABIs Available In:**
- out/TreasuryVault.sol/TreasuryVault.json
- out/MockSliqIDRegistry.sol/MockSliqIDRegistry.json
- out/MockFxOracle.sol/MockFxOracle.json
- out/MockERC20.sol/MockERC20.json

---

## Network Configuration

For MetaMask or other wallets:

```
Network Name: Moonbase Alpha
RPC URL: https://rpc.api.moonbase.moonbeam.network
Chain ID: 1287
Currency Symbol: DEV
Block Explorer: https://moonbase.moonscan.io
```

---

## Current Status

**Deployed:** 1 of 6 contracts (17%)
**Next Steps:**
1. Deploy MockSliqIDRegistry
2. Deploy TreasuryVault (requires registry address)
3. Deploy 3 mock ERC20 tokens
4. Configure oracle rates
5. Register test users
6. Verify all contracts

**Repository:** /home/robinsoncodes/Documents/Nigeria-Projects/SliqPay/smartcontracts
**Documentation:** docs/SMART_CONTRACTS_EXPLAINED.md (detailed technical guide)

**Last Updated:** November 10, 2025
