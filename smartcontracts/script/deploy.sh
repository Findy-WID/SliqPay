#!/bin/bash

###############################################################################
# SliqPay Contract Deployment Script for Moonbase Alpha
#
# This script deploys all SliqPay contracts in the correct order and
# configures them with initial settings.
#
# Prerequisites:
# 1. Foundry installed (forge, cast)
# 2. .env file configured with PRIVATE_KEY
# 3. DEV tokens in deployer wallet (from faucet)
#
# Usage:
#   ./script/deploy.sh
#
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f .env ]; then
    source .env
else
    echo -e "${RED}Error: .env file not found!${NC}"
    echo "Please create .env file with your PRIVATE_KEY"
    exit 1
fi

# Check required variables
if [ -z "$PRIVATE_KEY" ]; then
    echo -e "${RED}Error: PRIVATE_KEY not set in .env${NC}"
    exit 1
fi

# Network configuration
RPC_URL="${MOONBASE_RPC_URL:-https://rpc.api.moonbase.moonbeam.network}"
CHAIN_ID=1287

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}SliqPay Contract Deployment${NC}"
echo -e "${BLUE}=========================================${NC}"
echo -e "Network: Moonbase Alpha"
echo -e "Chain ID: $CHAIN_ID"
echo -e "RPC URL: $RPC_URL"
echo ""

# Get deployer address
DEPLOYER=$(cast wallet address --private-key $PRIVATE_KEY)
echo -e "Deployer Address: ${GREEN}$DEPLOYER${NC}"

# Check deployer balance
BALANCE=$(cast balance $DEPLOYER --rpc-url $RPC_URL)
echo -e "Deployer Balance: ${GREEN}$BALANCE${NC} wei"
echo ""

if [ "$BALANCE" == "0" ]; then
    echo -e "${YELLOW}Warning: Deployer has zero balance!${NC}"
    echo "Please fund your wallet at: https://faucet.moonbeam.network/"
    exit 1
fi

echo -e "${BLUE}Step 1: Deploying MockSliqIDRegistry...${NC}"
REGISTRY_ADDRESS=$(forge create contracts/mocks/MockSliqIDRegistry.sol:MockSliqIDRegistry \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --json | jq -r '.deployedTo')

if [ -z "$REGISTRY_ADDRESS" ] || [ "$REGISTRY_ADDRESS" == "null" ]; then
    echo -e "${RED}Failed to deploy MockSliqIDRegistry${NC}"
    exit 1
fi

echo -e "${GREEN}✓ MockSliqIDRegistry deployed at: $REGISTRY_ADDRESS${NC}"
echo ""

echo -e "${BLUE}Step 2: Deploying MockFxOracle...${NC}"
ORACLE_ADDRESS=$(forge create contracts/mocks/MockFxOracle.sol:MockFxOracle \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --json | jq -r '.deployedTo')

if [ -z "$ORACLE_ADDRESS" ] || [ "$ORACLE_ADDRESS" == "null" ]; then
    echo -e "${RED}Failed to deploy MockFxOracle${NC}"
    exit 1
fi

echo -e "${GREEN}✓ MockFxOracle deployed at: $ORACLE_ADDRESS${NC}"
echo ""

echo -e "${BLUE}Step 3: Deploying TreasuryVault...${NC}"
VAULT_ADDRESS=$(forge create contracts/TreasuryVault.sol:TreasuryVault \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --constructor-args $REGISTRY_ADDRESS $ORACLE_ADDRESS \
    --json | jq -r '.deployedTo')

if [ -z "$VAULT_ADDRESS" ] || [ "$VAULT_ADDRESS" == "null" ]; then
    echo -e "${RED}Failed to deploy TreasuryVault${NC}"
    exit 1
fi

echo -e "${GREEN}✓ TreasuryVault deployed at: $VAULT_ADDRESS${NC}"
echo ""

echo -e "${BLUE}Step 4: Deploying Mock ERC20 Tokens...${NC}"

# Deploy Mock USDT
USDT_ADDRESS=$(forge create contracts/mocks/MockERC20.sol:MockERC20 \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --constructor-args "Mock Tether" "mUSDT" 6 \
    --json | jq -r '.deployedTo')
echo -e "${GREEN}✓ Mock USDT deployed at: $USDT_ADDRESS${NC}"

# Deploy Mock USDC
USDC_ADDRESS=$(forge create contracts/mocks/MockERC20.sol:MockERC20 \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --constructor-args "Mock USD Coin" "mUSDC" 6 \
    --json | jq -r '.deployedTo')
echo -e "${GREEN}✓ Mock USDC deployed at: $USDC_ADDRESS${NC}"

# Deploy Mock DAI
DAI_ADDRESS=$(forge create contracts/mocks/MockERC20.sol:MockERC20 \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --constructor-args "Mock DAI" "mDAI" 18 \
    --json | jq -r '.deployedTo')
echo -e "${GREEN}✓ Mock DAI deployed at: $DAI_ADDRESS${NC}"
echo ""

echo -e "${BLUE}Step 5: Configuring contracts...${NC}"

# Set token rates in Oracle (all rates in NGN)
echo "  - Setting USDT rate (1500 NGN)..."
cast send $ORACLE_ADDRESS "setRate(address,uint256)" $USDT_ADDRESS 1500 \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY > /dev/null

echo "  - Setting USDC rate (1500 NGN)..."
cast send $ORACLE_ADDRESS "setRate(address,uint256)" $USDC_ADDRESS 1500 \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY > /dev/null

echo "  - Setting DAI rate (1485 NGN)..."
cast send $ORACLE_ADDRESS "setRate(address,uint256)" $DAI_ADDRESS 1485 \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY > /dev/null

echo "  - Setting native DEV rate (5000 NGN)..."
cast send $ORACLE_ADDRESS "setRate(address,uint256)" 0x0000000000000000000000000000000000000000 5000 \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY > /dev/null

# Register test SliqID
echo "  - Registering test SliqID (alice -> deployer)..."
cast send $REGISTRY_ADDRESS "registerSliqID(string,address)" "alice" $DEPLOYER \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY > /dev/null

# Mint test tokens to deployer
echo "  - Minting 10,000 USDT to deployer..."
cast send $USDT_ADDRESS "mint(address,uint256)" $DEPLOYER 10000000000 \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY > /dev/null

echo "  - Minting 10,000 USDC to deployer..."
cast send $USDC_ADDRESS "mint(address,uint256)" $DEPLOYER 10000000000 \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY > /dev/null

echo "  - Minting 10,000 DAI to deployer..."
cast send $DAI_ADDRESS "mint(address,uint256)" $DEPLOYER 10000000000000000000000 \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY > /dev/null

echo -e "${GREEN}✓ Configuration complete${NC}"
echo ""

# Save deployment addresses
DEPLOYMENT_FILE="deployments/moonbase-alpha.json"
mkdir -p deployments

cat > $DEPLOYMENT_FILE << EOF
{
  "network": "moonbase-alpha",
  "chainId": $CHAIN_ID,
  "deployer": "$DEPLOYER",
  "deployedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "contracts": {
    "MockSliqIDRegistry": "$REGISTRY_ADDRESS",
    "MockFxOracle": "$ORACLE_ADDRESS",
    "TreasuryVault": "$VAULT_ADDRESS",
    "MockUSDT": "$USDT_ADDRESS",
    "MockUSDC": "$USDC_ADDRESS",
    "MockDAI": "$DAI_ADDRESS"
  },
  "explorer": {
    "base": "https://moonbase.moonscan.io",
    "registry": "https://moonbase.moonscan.io/address/$REGISTRY_ADDRESS",
    "oracle": "https://moonbase.moonscan.io/address/$ORACLE_ADDRESS",
    "vault": "https://moonbase.moonscan.io/address/$VAULT_ADDRESS"
  }
}
EOF

echo -e "${GREEN}✓ Deployment addresses saved to: $DEPLOYMENT_FILE${NC}"
echo ""

# Print Summary
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}Deployment Summary${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""
echo -e "${YELLOW}Core Contracts:${NC}"
echo -e "  MockSliqIDRegistry: ${GREEN}$REGISTRY_ADDRESS${NC}"
echo -e "  MockFxOracle:       ${GREEN}$ORACLE_ADDRESS${NC}"
echo -e "  TreasuryVault:      ${GREEN}$VAULT_ADDRESS${NC}"
echo ""
echo -e "${YELLOW}Test Tokens:${NC}"
echo -e "  Mock USDT: ${GREEN}$USDT_ADDRESS${NC}"
echo -e "  Mock USDC: ${GREEN}$USDC_ADDRESS${NC}"
echo -e "  Mock DAI:  ${GREEN}$DAI_ADDRESS${NC}"
echo ""
echo -e "${YELLOW}Explorer Links:${NC}"
echo -e "  Registry: https://moonbase.moonscan.io/address/$REGISTRY_ADDRESS"
echo -e "  Oracle:   https://moonbase.moonscan.io/address/$ORACLE_ADDRESS"
echo -e "  Vault:    https://moonbase.moonscan.io/address/$VAULT_ADDRESS"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Verify contracts on Moonscan (optional)"
echo "  2. Test basic operations"
echo "  3. Integrate with backend API"
echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${BLUE}=========================================${NC}"
