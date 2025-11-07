SliqPay Africa – Blockchain Architecture & User Flow (Hackathon Prototype)
Overview
SliqPay Africa is building a unified payment layer for Africa — one that bridges Web2 and Web3 users under a single identity system called SliqID.
This hackathon prototype focuses on the core smart contract architecture that enables:

Seamless payments to human-readable SliqIDs

Multi-token crypto routing and accounting

Transparent internal ledgers and testable exchange logic

Core Blockchain Components
The prototype consists of three primary contracts (plus one optional testing oracle) that together form the backbone of the on-chain payment logic.

1️⃣ SliqIDRegistry.sol
Purpose:
Serves as the universal identity layer linking a user’s SliqID (e.g. @showict) to their wallet address and backend profile.

Core Features:

registerSliqID(string sliqId, address wallet, string emailOrPhone)
Registers a new SliqID and binds it to a wallet or backend-managed custodial wallet.
resolveAddress(string sliqId) → address
Retrieves the wallet address linked to the SliqID.
updateSliqID(...)
Allows admin or verified users to update details.

Events:
* SliqIDRegistered(sliqId, wallet)
* SliqIDUpdated(sliqId, newWallet)

Notes:
Enforces unique SliqIDs (case-insensitive).
Serves as the identity anchor used by all other contracts.

2️⃣ TreasuryVault.sol
Purpose:
Acts as the central payment router and balance tracker — handling all incoming transactions, asset routing, and internal ledger updates.

This contract effectively combines the logic of:

SmartRouter

Crypto Ledger

(Optional) FX Oracle integration

It’s the single entry point for all crypto deposits or payments to SliqIDs.

Core Functional Modules
🔹 A. Smart Routing Layer
Detects the token type (ETH, USDT, USDC, etc.).
Maps incoming payments to the right internal ledger.
Validates recipient SliqID and resolves it to the correct wallet via SliqIDRegistry.

Functions:

routePayment(string recipientSliqId, address token, uint256 amount)
Routes an incoming payment to the right sub-ledger.
Events:

PaymentRouted(sender, recipientSliqId, token, amount, timestamp)

🔹 B. Crypto Ledger Layer
Maintains per-token balances for every SliqID.

Data Structure Example:
mapping(string => mapping(address => uint256)) public sliqBalances;

Functions:
creditSliqID(string sliqId, address token, uint256 amount)
Increments user balance.
debitSliqID(string sliqId, address token, uint256 amount)
Decrements balance.
getBalance(string sliqId, address token) → uint256

Events:
BalanceUpdated(sliqId, token, newBalance)

Usage:
This layer ensures every user has a multi-token ledger that updates atomically during routing.

🔹 C. Conversion Layer (Optional Mock FX Oracle Integration)
Supports conversion between crypto and fiat or between tokens during internal testing.

Pulls rates from MockFxOracle.
Allows the backend to simulate conversions (e.g., 1 USDC = ₦1,500).

Functions:
convertAsset(string fromSliqId, string toSliqId, address fromToken, address toToken, uint256 amount)
Uses rate fetched from Oracle → updates both ledgers.

🔹 D. Admin & Security Controls
Role-based access (Admin, Operator)
Emergency pause (Pausable)
Withdrawal (by Admin for settlement or service provider payout)

Functions:
withdraw(address token, uint256 amount, address to)
pause(), unpause()

3️⃣ MockFxOracle.sol (Testing Only)
Purpose:
Simulates token conversion rates for demo or test purposes.
Allows you to test the cross-asset routing and balance update logic without connecting to Chainlink or external APIs.

Core Features:

setRate(address token, uint256 rateInNGN)
getRate(address token) → uint256
Used internally by TreasuryVault for asset conversions.

🧩 Contract Interaction Summary
Contract
Responsibility
Key Interaction
SliqIDRegistry
Registers and resolves unique SliqIDs
Called by TreasuryVault for identity mapping
TreasuryVault
Core payment router + ledger + FX handler
Entry point for all transactions
MockFxOracle
Mock conversion rate provider
Called by TreasuryVault during conversions

🌐 System Architecture
Frontend (WebApp)
- User Dashboard
- Send/Receive Crypto UI
- SliqID Registration UI
                │
               ▼
Backend / API Layer
- Handles Web2 Signups
- Creates Custodial Wallet
- Calls Smart Contracts
- Fetches rates / balances
                 │  
                ▼
Smart Contracts (EVM)
1. SliqIDRegistry
2. TreasuryVault
3. MockFxOracle (testing)

🔄 User Flow (Web2 + Web3 Hybrid)
1️⃣ User Onboarding
Web3 User: Connects wallet → Registers unique SliqID → Added to registry.
Web2 User: Signs up with email/phone → Backend generates custodial wallet → Registers SliqID on-chain on their behalf.

2️⃣ Sending Crypto
User enters recipient’s SliqID (e.g. @maryam) and amount.
Frontend or backend calls:
          routePayment("@maryam", tokenAddress, amount)

TreasuryVault:
Resolves SliqID via SliqIDRegistry.
Detects token type.
Updates on-chain ledger for @maryam.


3️⃣ Checking Balances
App fetches ledger data using:
getBalance("@maryam", tokenAddress)

Displays crypto and fiat equivalent (via Oracle rate).

4️⃣ Conversion (Test Scenario)
Backend or user initiates token conversion.
TreasuryVault fetches mock rate from Oracle and updates balances accordingly.

5️⃣ Settlement (Future Phase)
Admin initiates withdrawal to actual provider or user wallet once thresholds are met.
Logged transparently on-chain.

⚙️ Technical Notes
Language: Solidity ^0.8.x
Framework: Hardhat
Libraries: OpenZeppelin (Ownable, Pausable, ReentrancyGuard)
Network: Polygon Amoy / Base Sepolia (for testing)
Storage: Minimal on-chain, major metadata (emails, phone) off-chain via backend

🛠️ Development Roadmap for Hackathon Prototype
Phase
Task
Responsible
1
Implement & deploy SliqIDRegistry.sol
Solidity dev
2
Implement & deploy TreasuryVault.sol
Solidity dev
3
Implement & deploy MockFxOracle.sol	
Solidity dev
4
Integrate backend wallet management & test routes	
Backend dev
5
Build frontend dashboard (SliqID registration, send/receive)	
Frontend dev
6
Demo transaction flow (user → SliqID → ledger update)	
Team



🧩 Summary
Feature
Description
Unified Identity	
Every user has a SliqID linked to wallet or backend account
Crypto Routing	
TreasuryVault auto-detects asset type and routes funds
Internal Ledger	
Tracks all user token balances transparently
FX Simulation	
MockOracle enables testing token-to-fiat conversions
Hybrid Access	
Works for both Web3 and Web2 (custodial) users
Hack-Ready	
Clean architecture focused on demonstrable core logic

