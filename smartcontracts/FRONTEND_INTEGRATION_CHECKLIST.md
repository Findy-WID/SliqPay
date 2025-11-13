# 📋 Frontend Developer Integration Checklist

**⚠️ IMPORTANT:** This is your step-by-step guide for integrating SliqPay smart contracts. Follow this checklist in order.

---

## 🎯 Contract Addresses (Copy These Exactly)

```javascript
// config/contracts.js
export const CONTRACTS = {
  // ✅ REQUIRED - Identity System
  MockSliqIDRegistry: "0xCB282e2Dc4dB94AFC3d04d7AE81444D13836FBF4",

  // ✅ REQUIRED - Payment Router (Update after deployment!)
  TreasuryVault: "TBD_DEPLOY_FIRST",

  // ⚠️ OPTIONAL - Exchange Rates
  MockFxOracle: "0xeD3e610f22bd8cf6e9853978e758D0480e1D7A15",

  // ✅ REQUIRED - Test Tokens
  MockUSDT: "0x209F293cd21F8DAFAF83518849734Af259C35a07",
  MockUSDC: "0x50269d1A46B690e8c92C8cC877dBEe7B8B1a1CEd",
  MockDAI: "0xA1b7Aad793601d9C6bcE03a2a2CD0B80eEE229b7",
};

export const RPC_URL = "https://rpc.api.moonbase.moonbeam.network";
export const CHAIN_ID = 1287;
export const EXPLORER_URL = "https://moonbase.moonscan.io";
```

---

## ✅ Phase 1: Minimum Viable Product (DO THESE FIRST)

### Contract 1: SliqIDRegistry (Identity System)
**Address:** `0xCB282e2Dc4dB94AFC3d04d7AE81444D13836FBF4`

#### Functions You MUST Implement:

| Priority | Function | Where to Use | Example |
|----------|----------|--------------|---------|
| 🔴 HIGH | `registerSliqID(string, address)` | User registration page | When user creates account |
| 🔴 HIGH | `isSliqIDRegistered(string)` | Registration form validation | Check if "@alice" is available |
| 🔴 HIGH | `getSliqIDByAddress(address)` | Dashboard, profile display | Show user's username |
| 🔴 HIGH | `resolveAddress(string)` | Send money form | Verify recipient exists |

---

### Contract 2: TreasuryVault (Payment Engine)
**Address:** `TBD_AFTER_DEPLOYMENT` (Update this after backend deploys it!)

#### Functions You MUST Implement:

| Priority | Function | Where to Use | Example |
|----------|----------|--------------|---------|
| 🔴 HIGH | `routePayment(string, address, uint256)` | Send token page | Send USDT/USDC/DAI |
| 🔴 HIGH | `routePaymentNative(string)` | Send native token page | Send DEV |
| 🔴 HIGH | `getBalance(string, address)` | Show single token balance | Get user's USDT balance |
| 🔴 HIGH | `getBalances(string, address[])` | Dashboard | Get all balances at once |

---

### Contract 3: ERC20 Tokens (USDT, USDC, DAI)
**Addresses:** See above

#### Functions You MUST Implement:

| Priority | Function | Where to Use | Notes |
|----------|----------|--------------|-------|
| 🔴 HIGH | `approve(address, uint256)` | **BEFORE every token payment** | Approve TreasuryVault to spend |
| 🔴 HIGH | `balanceOf(address)` | Show wallet balance | Amount in user's wallet |
| 🔴 HIGH | `decimals()` | Format display | USDT=6, DAI=18 |

---

## ⚠️ Phase 2: Enhanced Features (OPTIONAL)

### Contract 4: MockFxOracle (Exchange Rates)
**Address:** `0xeD3e610f22bd8cf6e9853978e758D0480e1D7A15`

| Priority | Function | Where to Use |
|----------|----------|--------------|
| 🟡 MEDIUM | `getRate(address)` | Show fiat value ("100 USDT ≈ ₦150,000") |

---

## 🔥 CRITICAL: User Flow Implementation

### Flow 1: User Registration (First-Time Users)

```
1. User connects MetaMask → Get wallet address
2. Call getSliqIDByAddress(address) → Check if registered
3. If not registered:
   - Show registration form
   - Call isSliqIDRegistered("alice") → Check availability
   - Call registerSliqID("alice", address) → Register
   - Wait for transaction confirmation
4. Redirect to dashboard
```

**Functions Used:**
- ✅ `SliqIDRegistry.getSliqIDByAddress()`
- ✅ `SliqIDRegistry.isSliqIDRegistered()`
- ✅ `SliqIDRegistry.registerSliqID()`

---

### Flow 2: Display Balances

```
1. Get user's SliqID from previous flow
2. Call getBalances(sliqId, [USDT, USDC, DAI, 0x0])
3. Format results:
   - USDT: balance / 10^6
   - USDC: balance / 10^6
   - DAI: balance / 10^18
   - DEV: balance / 10^18
4. Display on dashboard
```

**Functions Used:**
- ✅ `TreasuryVault.getBalances()`

---

### Flow 3: Send Payment (MOST IMPORTANT)

```
🔴 FOR ERC20 TOKENS (USDT/USDC/DAI):

1. Validate recipient exists
   → Call isSliqIDRegistered("bob")

2. Convert amount to smallest unit
   → ethers.parseUnits("100", 6) for USDT

3. TRANSACTION 1: Approve token spending
   → token.approve(TREASURY_VAULT, amount)
   → WAIT for confirmation!

4. TRANSACTION 2: Send payment
   → vault.routePayment("bob", TOKEN_ADDRESS, amount)
   → WAIT for confirmation!

5. Refresh balances

🟢 FOR NATIVE TOKEN (DEV):

1. Validate recipient
2. Convert amount
3. ONE TRANSACTION:
   → vault.routePaymentNative("bob", {value: amount})
4. Refresh balances
```

**Functions Used:**
- ✅ `SliqIDRegistry.isSliqIDRegistered()`
- ✅ `ERC20.approve()` (for tokens only)
- ✅ `TreasuryVault.routePayment()` (for tokens)
- ✅ `TreasuryVault.routePaymentNative()` (for DEV)

---

## 🚨 CRITICAL WARNINGS

### ⚠️ Two-Transaction Pattern for Tokens

**Every token payment needs TWO transactions:**

```javascript
// ❌ WRONG - Will fail!
await vault.routePayment(recipient, token, amount);

// ✅ CORRECT
const approveTx = await token.approve(vaultAddress, amount);
await approveTx.wait(); // MUST wait!

const paymentTx = await vault.routePayment(recipient, token, amount);
await paymentTx.wait();
```

### ⚠️ Decimal Handling

**Different tokens have different decimals:**

```javascript
// USDT/USDC = 6 decimals
ethers.parseUnits("100", 6)  // 100 USDT = 100000000

// DAI/DEV = 18 decimals
ethers.parseUnits("100", 18) // 100 DAI = 100000000000000000000
```

### ⚠️ Always Validate Recipients

```javascript
// ✅ ALWAYS do this before sending
const exists = await registry.isSliqIDRegistered(recipient);
if (!exists) {
  return alert("User not found!");
}
```

---

## 📱 Page-by-Page Implementation Guide

### Page 1: Connect Wallet / Registration

**Features:**
- Connect MetaMask button
- Check network (Moonbase Alpha, chain ID 1287)
- Check if user has SliqID
- Registration form with availability check

**Contracts:**
- SliqIDRegistry: `getSliqIDByAddress()`, `isSliqIDRegistered()`, `registerSliqID()`

---

### Page 2: Dashboard / Home

**Features:**
- Display user's SliqID
- Show all token balances (USDT, USDC, DAI, DEV)
- Total balance in ₦ (optional, using Oracle)
- Recent transactions list

**Contracts:**
- TreasuryVault: `getBalances()`
- MockFxOracle: `getRate()` (optional)

---

### Page 3: Send Money

**Features:**
- Recipient input (SliqID)
- Amount input
- Token selector dropdown
- Validate & send button

**Contracts:**
- SliqIDRegistry: `isSliqIDRegistered()`
- ERC20: `approve()`
- TreasuryVault: `routePayment()` or `routePaymentNative()`

---

### Page 4: Receive Money

**Features:**
- Display user's SliqID (QR code?)
- "Share your SliqID" button
- Copy to clipboard

**Contracts:**
- SliqIDRegistry: `getSliqIDByAddress()`

---

## 🧪 Testing Checklist

Before shipping to production, test these scenarios:

- [ ] Connect wallet successfully
- [ ] Switch to Moonbase Alpha network
- [ ] Register a new SliqID
- [ ] Check username availability (available)
- [ ] Check username availability (taken)
- [ ] View dashboard with zero balances
- [ ] Get test tokens from faucet
- [ ] View dashboard with non-zero balances
- [ ] Send USDT to another user (both transactions work)
- [ ] Send USDC to another user
- [ ] Send DAI to another user
- [ ] Send DEV (native) to another user (one transaction)
- [ ] Try to send to non-existent user (should fail gracefully)
- [ ] Try to send with insufficient balance (should fail gracefully)
- [ ] View transaction on Moonscan
- [ ] Refresh balances after sending
- [ ] Receive payment and see balance update

---

## 📚 Full Documentation

For complete code examples, ABIs, and detailed explanations, see:

**Main Documentation:**
- `docs/SMART_CONTRACTS_EXPLAINED.md` - Complete integration guide with React code
- `VERIFICATION_GUIDE.md` - Contract verification instructions
- `deployments/moonbase-alpha.json` - All deployed addresses

---

## 🆘 Getting Help

**If you encounter issues:**

1. Check contract is on correct network (Moonbase Alpha, 1287)
2. Verify contract addresses are correct
3. Ensure user approved token spending before payment
4. Check recipient SliqID is registered
5. Verify amount has correct decimals
6. Look for error messages in console
7. View transaction on Moonscan for details

**Common Errors:**
- "User not found" → Recipient SliqID doesn't exist
- "Insufficient balance" → User doesn't have enough tokens
- "Transfer failed" → Approval didn't complete or insufficient allowance

---

**Last Updated:** 2025-11-12
**For:** Frontend Developer Integration
**Backend Contact:** [Your Name/Team]
