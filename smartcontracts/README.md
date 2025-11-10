# SliqPay Smart Contracts

Blockchain smart contracts for SliqPay's unified payment system on Moonbase Alpha testnet.

## Overview

SliqPay enables cryptocurrency payments using human-readable usernames instead of wallet addresses. Users can send payments to "@alice" instead of "0x1234...5678".

## Deployed Contracts

**Network:** Moonbase Alpha (Chain ID: 1287)
**RPC:** https://rpc.api.moonbase.moonbeam.network

- **MockFxOracle:** 0xeD3e610f22bd8cf6e9853978e758D0480e1D7A15

See CONTRACTS.md for complete deployment information and interaction guide.

## Quick Start

```bash
# Compile contracts
forge build

# Deploy (see CONTRACTS.md for commands)
export PRIVATE_KEY=your_private_key
export RPC=https://rpc.api.moonbase.moonbeam.network

# Interact with deployed contracts
cast call 0xeD3e610f22bd8cf6e9853978e758D0480e1D7A15 \
  "getRate(address)(uint256)" TOKEN_ADDRESS \
  --rpc-url https://rpc.api.moonbase.moonbeam.network
```

## Documentation

- **CONTRACTS.md** - Complete deployment and interaction guide
- **docs/SMART_CONTRACTS_EXPLAINED.md** - Technical deep dive

## Contracts

- **TreasuryVault.sol** - Main payment router (1,072 lines)
- **MockSliqIDRegistry.sol** - Identity mapping (259 lines)
- **MockFxOracle.sol** - Exchange rates (290 lines)
- **MockERC20.sol** - Test tokens (282 lines)

## Security

- Reentrancy protection
- Pausable functionality
- Access control (Owner/Operator/User roles)
- Input validation

## Support

Repository: /home/robinsoncodes/Documents/Nigeria-Projects/SliqPay/smartcontracts
Network: Moonbase Alpha Testnet
