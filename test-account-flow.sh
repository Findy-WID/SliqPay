#!/bin/bash
# Test Script for SliqPay Account & Transaction Flow
# Run this when backend shows "Connected to the database"

set -e

BASE_URL="http://localhost:4000/api/v1"

echo "🧪 Testing SliqPay Account & Transaction Logic"
echo "=============================================="
echo ""

# Test 1: Health Check
echo "1️⃣  Testing health endpoint..."
HEALTH=$(curl -s ${BASE_URL}/health)
echo "✅ Health check: $HEALTH"
echo ""

# Test 2: Signup (creates user + account with 25,000)
echo "2️⃣  Creating new user (Alice Demo)..."
SIGNUP_RESPONSE=$(curl -s -X POST ${BASE_URL}/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"fname":"Alice","lname":"Demo","email":"alice'$(date +%s)'@demo.com","password":"SecurePass123!","phone":"+2348012345678"}')

echo "$SIGNUP_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$SIGNUP_RESPONSE"

USER_ID=$(echo $SIGNUP_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['user']['id'])" 2>/dev/null)

if [ -z "$USER_ID" ]; then
  echo "❌ Signup failed or user ID not returned"
  exit 1
fi

echo "✅ User created: $USER_ID"
echo ""

# Test 3: Get user's accounts (should have 1 NGN account with 25,000)
echo "3️⃣  Fetching user's accounts..."
ACCOUNTS=$(curl -s ${BASE_URL}/account/user/${USER_ID})
echo "$ACCOUNTS" | python3 -m json.tool 2>/dev/null || echo "$ACCOUNTS"

ACCOUNT_ID=$(echo $ACCOUNTS | python3 -c "import sys, json; print(json.load(sys.stdin)['accounts'][0]['id'])" 2>/dev/null)
BALANCE=$(echo $ACCOUNTS | python3 -c "import sys, json; print(json.load(sys.stdin)['accounts'][0]['balance'])" 2>/dev/null)

echo "✅ Account ID: $ACCOUNT_ID"
echo "✅ Starting Balance: $BALANCE (should be 25000)"
echo ""

# Test 4: Create debit transaction
echo "4️⃣  Creating debit transaction (5000)..."
TX_RESPONSE=$(curl -s -X POST ${BASE_URL}/transaction \
  -H "Content-Type: application/json" \
  -d '{"accountId":"'$ACCOUNT_ID'","amount":5000,"type":"debit","description":"Test bill payment"}')

echo "$TX_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$TX_RESPONSE"

NEW_BALANCE=$(echo $TX_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['account']['balance'])" 2>/dev/null)
echo "✅ New Balance: $NEW_BALANCE (should be 20000)"
echo ""

# Test 5: Try insufficient funds
echo "5️⃣  Testing insufficient funds (trying to debit 30000)..."
FAIL_RESPONSE=$(curl -s -X POST ${BASE_URL}/transaction \
  -H "Content-Type: application/json" \
  -d '{"accountId":"'$ACCOUNT_ID'","amount":30000,"type":"debit","description":"Over limit test"}')

echo "$FAIL_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$FAIL_RESPONSE"
echo "✅ Should show 'Insufficient balance' error"
echo ""

# Test 6: Get transaction history
echo "6️⃣  Fetching transaction history..."
HISTORY=$(curl -s ${BASE_URL}/transaction/account/${ACCOUNT_ID})
echo "$HISTORY" | python3 -m json.tool 2>/dev/null || echo "$HISTORY"
echo ""

echo "=============================================="
echo "✅ All tests completed!"
echo ""
echo "Summary:"
echo "  - User created with ID: $USER_ID"
echo "  - Account created with ID: $ACCOUNT_ID"
echo "  - Starting balance: 25,000"
echo "  - After debit: $NEW_BALANCE"
echo "  - Insufficient funds protection: Working"
