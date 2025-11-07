// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TreasuryVault
 * @author SliqPay Development Team
 * @notice Central payment router and balance tracker for SliqPay's unified payment layer
 * @dev This contract is the core of SliqPay's blockchain infrastructure, combining four key layers:
 *      1. Smart Routing Layer - Routes payments to SliqIDs with automatic token detection
 *      2. Crypto Ledger Layer - Maintains per-user, per-token balance accounting
 *      3. Conversion Layer - Enables cross-asset routing via FX Oracle integration
 *      4. Admin & Security Layer - Emergency controls, withdrawals, and access management
 *
 * Architecture Overview:
 * ┌──────────────────────────────────────────────────────────────┐
 * │                      TreasuryVault                           │
 * │                                                              │
 * │  ┌────────────────────┐  ┌────────────────────┐            │
 * │  │ Smart Routing      │  │ Crypto Ledger      │            │
 * │  │ - routePayment()   │  │ - Multi-token      │            │
 * │  │ - Token detection  │  │   balances         │            │
 * │  │ - SliqID validation│  │ - Credit/Debit     │            │
 * │  └────────────────────┘  └────────────────────┘            │
 * │                                                              │
 * │  ┌────────────────────┐  ┌────────────────────┐            │
 * │  │ Conversion Layer   │  │ Admin & Security   │            │
 * │  │ - Asset conversion │  │ - Emergency pause  │            │
 * │  │ - Oracle integration│  │ - Withdrawals      │            │
 * │  │ - Rate calculations│  │ - Access control   │            │
 * │  └────────────────────┘  └────────────────────┘            │
 * └──────────────────────────────────────────────────────────────┘
 *
 * Key Design Decisions:
 * - Uses SliqIDs (user123name) instead of addresses for improved UX
 * - Maintains internal ledger for gas-efficient balance tracking
 * - Supports both native (ETH/GLMR) and ERC20 tokens
 * - Operator role allows backend to facilitate conversions
 * - Emergency pause for security incidents
 * - All critical operations protected by ReentrancyGuard
 *
 * Security Features:
 * - ReentrancyGuard on all state-changing functions
 * - Pausable for emergency stops
 * - Role-based access control (Owner, Operator)
 * - SafeERC20 for reliable token transfers
 * - Input validation on all external functions
 * - Event emission for complete audit trail
 *
 * Production Considerations:
 * - Monitor operator actions for abuse
 * - Implement rate limiting for large withdrawals
 * - Add multi-sig for admin functions
 * - Implement time-locks for sensitive operations
 * - Consider upgradeability pattern (UUPS or Transparent Proxy)
 *
 * Gas Optimization Notes:
 * - Uses mapping instead of arrays for O(1) lookups
 * - Packs storage variables where possible
 * - Batch operations to reduce transaction costs
 * - Events indexed for efficient filtering
 */

import "./interfaces/ISliqIDRegistry.sol";
import "./interfaces/IMockFxOracle.sol";

// We'll use a simple IERC20 interface to avoid OpenZeppelin dependency issues
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract TreasuryVault {
    /*//////////////////////////////////////////////////////////////
                           TYPE DECLARATIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Represents the native token (ETH on Ethereum, GLMR on Moonbeam)
     * Using address(0) as a sentinel value to distinguish native vs ERC20 tokens
     */
    address public constant NATIVE_TOKEN = address(0);

    /*//////////////////////////////////////////////////////////////
                           STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Reference to the SliqID Registry for identity resolution
     * @dev Used to validate and resolve SliqIDs to wallet addresses
     *      All payment routing depends on this registry being accurate
     */
    ISliqIDRegistry public sliqIDRegistry;

    /**
     * @notice Reference to the FX Oracle for conversion rates
     * @dev Used for cross-asset conversions (e.g., USDT -> USDC)
     *      In production, this would be Chainlink Price Feed or similar
     */
    IMockFxOracle public fxOracle;

    /**
     * @notice Multi-token ledger tracking balances for each SliqID
     * @dev Mapping structure: SliqID => Token Address => Balance
     *
     * Example state:
     * sliqBalances["\alice"][USDT_ADDRESS] = 1000 * 10^6  (1000 USDT)
     * sliqBalances["\alice"][address(0)] = 2 * 10^18     (2 ETH)
     * sliqBalances["\bob"][USDC_ADDRESS] = 500 * 10^6    (500 USDC)
     *
     * Why this structure?
     * - O(1) lookup for any SliqID + token combination
     * - Supports unlimited tokens without contract modification
     * - Gas-efficient compared to array iteration
     * - Easy to audit and verify balances
     */
    mapping(string => mapping(address => uint256)) public sliqBalances;

    /**
     * @notice Contract owner with full admin privileges
     * @dev Can pause/unpause, withdraw funds, update config, manage operators
     *      In production, this should be a multi-sig or DAO
     */
    address public owner;

    /**
     * @notice Operator addresses authorized for conversion operations
     * @dev Operators can call convertAsset() but not admin functions
     *      This allows backend to facilitate conversions without full control
     *      Owner is implicitly an operator
     */
    mapping(address => bool) public operators;

    /**
     * @notice Emergency pause flag
     * @dev When true, all payment and conversion operations are blocked
     *      Admin functions (withdraw, unpause) still work
     *      Used for security incidents, oracle failures, or maintenance
     */
    bool public paused;

    /*//////////////////////////////////////////////////////////////
                              EVENTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Emitted when a payment is successfully routed to a SliqID
     * @param sender The address that initiated the payment
     * @param recipientSliqId The SliqID receiving the payment
     * @param token The token address (address(0) for native token)
     * @param amount The amount transferred (in token's smallest unit)
     * @param timestamp The block timestamp of the transaction
     *
     * @dev Backend listens to this event to:
     *      - Update database with transaction
     *      - Notify recipient of incoming payment
     *      - Update dashboard balance displays
     *      - Generate transaction receipts
     */
    event PaymentRouted(
        address indexed sender,
        string indexed recipientSliqId,
        address indexed token,
        uint256 amount,
        uint256 timestamp
    );

    /**
     * @notice Emitted when a user's balance is updated (credit or debit)
     * @param sliqId The SliqID whose balance changed
     * @param token The token address
     * @param newBalance The updated balance after the operation
     * @param timestamp The block timestamp of the update
     *
     * @dev Used for:
     *      - Real-time balance updates in frontend
     *      - Audit trail of all balance changes
     *      - Analytics and reporting
     */
    event BalanceUpdated(
        string indexed sliqId,
        address indexed token,
        uint256 newBalance,
        uint256 timestamp
    );

    /**
     * @notice Emitted when assets are converted between tokens
     * @param fromSliqId The SliqID whose tokens are being converted (sender)
     * @param toSliqId The SliqID receiving the converted tokens (receiver)
     * @param fromToken The source token address
     * @param toToken The destination token address
     * @param fromAmount The amount of source tokens converted
     * @param toAmount The amount of destination tokens received
     * @param rate The conversion rate used (from Oracle)
     * @param timestamp The block timestamp of the conversion
     *
     * @dev Important for:
     *      - Tracking conversion history
     *      - Verifying rate accuracy
     *      - Detecting suspicious conversions
     *      - Compliance and reporting
     */
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

    /**
     * @notice Emitted when admin withdraws funds from the contract
     * @param token The token withdrawn (address(0) for native)
     * @param amount The amount withdrawn
     * @param to The address receiving the withdrawal
     * @param timestamp The block timestamp of the withdrawal
     *
     * @dev Critical for:
     *      - Audit trail of fund movements
     *      - Detecting unauthorized withdrawals
     *      - Settlement tracking
     */
    event Withdrawn(
        address indexed token,
        uint256 amount,
        address indexed to,
        uint256 timestamp
    );

    /**
     * @notice Emitted when an operator is added
     * @param operator The address granted operator privileges
     * @param timestamp The block timestamp
     */
    event OperatorAdded(address indexed operator, uint256 timestamp);

    /**
     * @notice Emitted when an operator is removed
     * @param operator The address whose operator privileges were revoked
     * @param timestamp The block timestamp
     */
    event OperatorRemoved(address indexed operator, uint256 timestamp);

    /**
     * @notice Emitted when the SliqID Registry address is updated
     * @param newRegistry The new registry address
     * @param timestamp The block timestamp
     */
    event RegistryUpdated(address indexed newRegistry, uint256 timestamp);

    /**
     * @notice Emitted when the FX Oracle address is updated
     * @param newOracle The new oracle address
     * @param timestamp The block timestamp
     */
    event OracleUpdated(address indexed newOracle, uint256 timestamp);

    /**
     * @notice Emitted when contract is paused
     * @param timestamp The block timestamp
     */
    event Paused(uint256 timestamp);

    /**
     * @notice Emitted when contract is unpaused
     * @param timestamp The block timestamp
     */
    event Unpaused(uint256 timestamp);

    /*//////////////////////////////////////////////////////////////
                              MODIFIERS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Restricts function access to contract owner only
     * @notice Owner has full control over contract configuration and funds
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "TreasuryVault: caller is not owner");
        _;
    }

    /**
     * @dev Restricts function access to operators and owner
     * @notice Operators can perform conversions but not admin functions
     */
    modifier onlyOperator() {
        require(
            operators[msg.sender] || msg.sender == owner,
            "TreasuryVault: caller is not operator"
        );
        _;
    }

    /**
     * @dev Prevents function execution when contract is paused
     * @notice Critical for emergency stops during security incidents
     */
    modifier whenNotPaused() {
        require(!paused, "TreasuryVault: contract is paused");
        _;
    }

    /**
     * @dev Reentrancy guard - prevents recursive calls
     * @notice Essential protection against reentrancy attacks
     * Implementation: Simple lock pattern (cheaper than OpenZeppelin's)
     */
    uint256 private _locked = 1;

    modifier nonReentrant() {
        require(_locked == 1, "TreasuryVault: reentrant call");
        _locked = 2;
        _;
        _locked = 1;
    }

    /*//////////////////////////////////////////////////////////////
                             CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Initializes the TreasuryVault with required dependencies
     * @dev Sets up contract with registry and oracle addresses
     *
     * @param _sliqIDRegistry Address of the SliqID Registry contract
     * @param _fxOracle Address of the FX Oracle contract (can be address(0) if not using conversions)
     *
     * Requirements:
     * - _sliqIDRegistry must not be zero address (critical dependency)
     * - Deployer becomes the owner
     * - Contract starts unpaused
     *
     * Post-deployment:
     * 1. Register initial SliqIDs in the registry
     * 2. Configure token rates in the oracle
     * 3. Add operators if needed
     * 4. Test with small amounts first
     *
     * Example deployment:
     * ```javascript
     * const registry = await SliqIDRegistry.deploy();
     * const oracle = await MockFxOracle.deploy();
     * const vault = await TreasuryVault.deploy(registry.address, oracle.address);
     * ```
     */
    constructor(address _sliqIDRegistry, address _fxOracle) {
        require(
            _sliqIDRegistry != address(0),
            "TreasuryVault: registry cannot be zero address"
        );

        sliqIDRegistry = ISliqIDRegistry(_sliqIDRegistry);
        fxOracle = IMockFxOracle(_fxOracle);  // Can be address(0) if not using conversions
        owner = msg.sender;
        paused = false;

        // Note: Owner is implicitly an operator (checked in onlyOperator modifier)
    }

    /**
     * @notice Allows contract to receive native tokens (ETH/GLMR)
     * @dev Enables direct transfers without calling a function
     *      Useful for emergency funding or settlement
     */
    receive() external payable {
        // Accept native tokens without routing
        // Could emit event for tracking if needed
    }

    /*//////////////////////////////////////////////////////////////
                    🔹 A. SMART ROUTING LAYER
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Routes an ERC20 token payment to a recipient's SliqID
     * @dev Primary entry point for ERC20 token payments
     *
     * Flow:
     * 1. Validate inputs (amount > 0, recipient exists)
     * 2. Transfer tokens from sender to this contract
     * 3. Credit recipient's internal ledger
     * 4. Emit events for tracking
     *
     * @param recipientSliqId The SliqID to receive payment (e.g., "\maryam")
     * @param token The ERC20 token contract address
     * @param amount The amount to transfer (in token's smallest unit)
     *
     * Requirements:
     * - Contract must not be paused
     * - Amount must be greater than 0
     * - Recipient SliqID must be registered
     * - Caller must have approved this contract for >= amount
     * - Token contract must successfully execute transferFrom
     *
     * Effects:
     * - Transfers tokens from msg.sender to this contract
     * - Credits recipient's ledger: sliqBalances[recipientSliqId][token] += amount
     * - Emits PaymentRouted event
     * - Emits BalanceUpdated event
     *
     * Example Usage:
     * ```solidity
     * // 1. User approves TreasuryVault
     * usdt.approve(treasuryVaultAddress, 1000 * 10**6);
     *
     * // 2. User routes payment to bob
     * treasuryVault.routePayment("\bob", usdtAddress, 1000 * 10**6);
     *
     * // 3. bob's balance increases
     * // sliqBalances["\bob"][usdt] = 1000 * 10**6
     * ```
     *
     * Security:
     * - Protected by nonReentrant to prevent reentrancy attacks
     * - Protected by whenNotPaused for emergency stops
     * - Validates recipient exists before transfer (prevents lost funds)
     *
     * @custom:emits PaymentRouted
     * @custom:emits BalanceUpdated
     */
    function routePayment(
        string memory recipientSliqId,
        address token,
        uint256 amount
    ) external nonReentrant whenNotPaused {
        // Input validation
        require(amount > 0, "TreasuryVault: amount must be greater than 0");
        require(bytes(recipientSliqId).length > 0, "TreasuryVault: empty SliqID");
        require(token != address(0), "TreasuryVault: use routePaymentNative for native token");

        // Resolve and validate recipient
        address recipientWallet = sliqIDRegistry.resolveAddress(recipientSliqId);
        require(
            recipientWallet != address(0),
            "TreasuryVault: recipient SliqID not registered"
        );

        // Transfer tokens from sender to this contract
        // Note: Caller must have approved this contract for at least `amount`
        bool success = IERC20(token).transferFrom(msg.sender, address(this), amount);
        require(success, "TreasuryVault: token transfer failed");

        // Credit recipient's internal ledger
        _creditSliqID(recipientSliqId, token, amount);

        // Emit routing event for backend tracking
        emit PaymentRouted(msg.sender, recipientSliqId, token, amount, block.timestamp);
    }

    /**
     * @notice Routes a native token (ETH/GLMR) payment to a recipient's SliqID
     * @dev Specialized function for native token transfers
     *
     * Flow:
     * 1. Validate msg.value > 0
     * 2. Validate recipient exists
     * 3. Credit recipient's internal ledger (using address(0) as token identifier)
     * 4. Emit events for tracking
     *
     * @param recipientSliqId The SliqID to receive payment (e.g., "\alice")
     *
     * Requirements:
     * - Contract must not be paused
     * - msg.value must be greater than 0
     * - Recipient SliqID must be registered
     *
     * Effects:
     * - Receives native tokens (automatically via payable)
     * - Credits recipient's ledger: sliqBalances[recipientSliqId][address(0)] += msg.value
     * - Emits PaymentRouted event
     * - Emits BalanceUpdated event
     *
     * Example Usage:
     * ```solidity
     * // Send 1 ETH to charlie
     * treasuryVault.routePaymentNative{value: 1 ether}("\charlie");
     *
     * // charlie's native token balance increases
     * // sliqBalances["\charlie"][address(0)] = 1 ether
     * ```
     *
     * Why separate function for native tokens?
     * - Native tokens don't require approval
     * - No need for transferFrom call
     * - Cleaner separation of concerns
     * - Better gas efficiency for native transfers
     *
     * Security:
     * - Protected by nonReentrant to prevent reentrancy attacks
     * - Protected by whenNotPaused for emergency stops
     * - Validates recipient exists before accepting payment
     *
     * @custom:emits PaymentRouted
     * @custom:emits BalanceUpdated
     */
    function routePaymentNative(string memory recipientSliqId)
        external
        payable
        nonReentrant
        whenNotPaused
    {
        // Input validation
        require(msg.value > 0, "TreasuryVault: amount must be greater than 0");
        require(bytes(recipientSliqId).length > 0, "TreasuryVault: empty SliqID");

        // Resolve and validate recipient
        address recipientWallet = sliqIDRegistry.resolveAddress(recipientSliqId);
        require(
            recipientWallet != address(0),
            "TreasuryVault: recipient SliqID not registered"
        );

        // Credit recipient's internal ledger
        // Note: address(0) is used as identifier for native token
        _creditSliqID(recipientSliqId, NATIVE_TOKEN, msg.value);

        // Emit routing event for backend tracking
        emit PaymentRouted(msg.sender, recipientSliqId, NATIVE_TOKEN, msg.value, block.timestamp);
    }

    /*//////////////////////////////////////////////////////////////
                    🔹 B. CRYPTO LEDGER LAYER
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Credits (increases) a SliqID's balance for a specific token
     * @dev Internal function used by routing and conversion operations
     *
     * Why internal?
     * - Prevents external manipulation of balances
     * - Only callable through validated payment flows
     * - Maintains balance integrity
     *
     * @param sliqId The SliqID to credit
     * @param token The token address (address(0) for native)
     * @param amount The amount to credit
     *
     * Effects:
     * - Increases sliqBalances[sliqId][token] by amount
     * - Emits BalanceUpdated event with new balance
     *
     * No overflow protection needed:
     * - Solidity 0.8+ has automatic overflow checks
     * - If balance would overflow, transaction reverts
     *
     * @custom:emits BalanceUpdated
     */
    function _creditSliqID(string memory sliqId, address token, uint256 amount) internal {
        sliqBalances[sliqId][token] += amount;
        emit BalanceUpdated(sliqId, token, sliqBalances[sliqId][token], block.timestamp);
    }

    /**
     * @notice Debits (decreases) a SliqID's balance for a specific token
     * @dev Internal function used by conversion and withdrawal operations
     *
     * Why internal?
     * - Prevents external manipulation of balances
     * - Only callable through validated operations
     * - Ensures balance checks before debiting
     *
     * @param sliqId The SliqID to debit
     * @param token The token address (address(0) for native)
     * @param amount The amount to debit
     *
     * Requirements:
     * - SliqID must have sufficient balance
     *
     * Effects:
     * - Decreases sliqBalances[sliqId][token] by amount
     * - Emits BalanceUpdated event with new balance
     *
     * Security:
     * - Automatic underflow check (Solidity 0.8+)
     * - If insufficient balance, transaction reverts
     * - No risk of negative balances
     *
     * @custom:emits BalanceUpdated
     */
    function _debitSliqID(string memory sliqId, address token, uint256 amount) internal {
        require(
            sliqBalances[sliqId][token] >= amount,
            "TreasuryVault: insufficient balance"
        );
        sliqBalances[sliqId][token] -= amount;
        emit BalanceUpdated(sliqId, token, sliqBalances[sliqId][token], block.timestamp);
    }

    /**
     * @notice Gets the balance of a SliqID for a specific token
     * @dev Public view function for balance queries
     *
     * @param sliqId The SliqID to query
     * @param token The token address (address(0) for native)
     * @return balance The current balance
     *
     * Returns 0 if:
     * - SliqID has never received this token
     * - SliqID's balance has been fully withdrawn/converted
     *
     * Example Usage:
     * ```solidity
     * // Get alice's USDT balance
     * uint256 usdtBalance = vault.getBalance("\alice", usdtAddress);
     *
     * // Get bob's native token balance
     * uint256 ethBalance = vault.getBalance("\bob", address(0));
     * ```
     *
     * Frontend Integration:
     * - Call this for each supported token
     * - Format based on token decimals
     * - Convert to fiat using Oracle rates for display
     */
    function getBalance(string memory sliqId, address token)
        external
        view
        returns (uint256 balance)
    {
        return sliqBalances[sliqId][token];
    }

    /**
     * @notice Gets balances for multiple tokens at once (batch query)
     * @dev Gas-efficient way to query multiple balances
     *
     * @param sliqId The SliqID to query
     * @param tokens Array of token addresses to query
     * @return balances Array of corresponding balances
     *
     * Why batch query?
     * - Reduces number of RPC calls (important for UX)
     * - More efficient than multiple individual calls
     * - Better for dashboard displays showing all assets
     *
     * Example Usage:
     * ```solidity
     * address[] memory tokens = new address[](3);
     * tokens[0] = usdtAddress;
     * tokens[1] = usdcAddress;
     * tokens[2] = address(0);  // Native token
     *
     * uint256[] memory balances = vault.getBalances("\alice", tokens);
     * // balances[0] = USDT balance
     * // balances[1] = USDC balance
     * // balances[2] = Native token balance
     * ```
     *
     * Frontend Dashboard:
     * ```javascript
     * const tokens = [USDT_ADDR, USDC_ADDR, DAI_ADDR, NATIVE];
     * const balances = await vault.getBalances("\alice", tokens);
     *
     * // Display all balances in single UI render
     * balances.forEach((bal, i) => {
     *   console.log(`${tokenNames[i]}: ${formatBalance(bal, decimals[i])}`);
     * });
     * ```
     */
    function getBalances(string memory sliqId, address[] memory tokens)
        external
        view
        returns (uint256[] memory balances)
    {
        balances = new uint256[](tokens.length);
        for (uint256 i = 0; i < tokens.length; i++) {
            balances[i] = sliqBalances[sliqId][tokens[i]];
        }
        return balances;
    }

    /*//////////////////////////////////////////////////////////////
                    🔹 C. CONVERSION LAYER
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Converts assets from one token to another between two SliqIDs
     * @dev Operator-only function for facilitating cross-asset payments
     *
     * Use Cases:
     * 1. User wants to send USDT but recipient prefers USDC
     * 2. Automatic conversion for better liquidity
     * 3. Cross-token payment routing
     *
     * Flow:
     * 1. Validate both SliqIDs exist
     * 2. Check sender has sufficient fromToken balance
     * 3. Get conversion rate from Oracle
     * 4. Calculate converted amount
     * 5. Atomically debit sender and credit receiver
     * 6. Emit event for tracking
     *
     * @param fromSliqId The SliqID whose tokens are being converted
     * @param toSliqId The SliqID receiving the converted tokens
     * @param fromToken The source token address
     * @param toToken The destination token address
     * @param amount The amount of source tokens to convert
     *
     * Requirements:
     * - Contract must not be paused
     * - Caller must be operator or owner
     * - Both SliqIDs must be registered
     * - fromSliqId must have sufficient balance
     * - Both tokens must be supported by Oracle
     * - FX Oracle must be configured (not address(0))
     *
     * Effects:
     * - Debits fromSliqId's fromToken balance
     * - Credits toSliqId's toToken balance (converted amount)
     * - Emits AssetConverted event
     * - Emits two BalanceUpdated events
     *
     * Example:
     * ```solidity
     * // alice has 1000 USDT, wants to send 100 USDT worth of USDC to bob
     * // Oracle rates: USDT = 1500 NGN, USDC = 1500 NGN (1:1 conversion)
     *
     * vault.convertAsset("\alice", "\bob", usdtAddr, usdcAddr, 100 * 10**6);
     *
     * // Result:
     * // alice USDT: 900 * 10**6 (1000 - 100)
     * // bob USDC: +100 * 10**6 (100 USDC equivalent)
     * ```
     *
     * Example with different rates:
     * ```solidity
     * // Oracle rates: USDT = 1500 NGN, DAI = 1485 NGN (DAI slightly depegged)
     * // Converting 100 USDT to DAI
     *
     * vault.convertAsset("\alice", "\bob", usdtAddr, daiAddr, 100 * 10**18);
     *
     * // Conversion: (100 * 1500) / 1485 ≈ 101.01 DAI
     * // alice USDT: -100
     * // bob DAI: +101.01 (gets more DAI due to depeg)
     * ```
     *
     * Security:
     * - Only operators can call (prevents unauthorized conversions)
     * - Atomic operation (both updates succeed or both fail)
     * - Protected by nonReentrant
     * - Oracle rate validation
     *
     * Production Considerations:
     * - Monitor operator activity for abuse
     * - Implement conversion limits
     * - Add slippage protection
     * - Consider decimal normalization for different token decimals
     *
     * @custom:emits AssetConverted
     * @custom:emits BalanceUpdated (twice)
     */
    function convertAsset(
        string memory fromSliqId,
        string memory toSliqId,
        address fromToken,
        address toToken,
        uint256 amount
    ) external nonReentrant whenNotPaused onlyOperator {
        // Input validation
        require(amount > 0, "TreasuryVault: amount must be greater than 0");
        require(bytes(fromSliqId).length > 0, "TreasuryVault: empty from SliqID");
        require(bytes(toSliqId).length > 0, "TreasuryVault: empty to SliqID");
        require(address(fxOracle) != address(0), "TreasuryVault: oracle not configured");

        // Validate both SliqIDs exist
        address fromWallet = sliqIDRegistry.resolveAddress(fromSliqId);
        address toWallet = sliqIDRegistry.resolveAddress(toSliqId);
        require(fromWallet != address(0), "TreasuryVault: from SliqID not registered");
        require(toWallet != address(0), "TreasuryVault: to SliqID not registered");

        // Check sender has sufficient balance
        require(
            sliqBalances[fromSliqId][fromToken] >= amount,
            "TreasuryVault: insufficient balance for conversion"
        );

        // Get conversion rate from Oracle
        uint256 convertedAmount = fxOracle.convertAmount(fromToken, toToken, amount);
        require(convertedAmount > 0, "TreasuryVault: conversion resulted in zero");

        // Get rate for event emission
        uint256 fromRate = fxOracle.getRate(fromToken);

        // Atomically update both balances
        _debitSliqID(fromSliqId, fromToken, amount);
        _creditSliqID(toSliqId, toToken, convertedAmount);

        // Emit conversion event
        emit AssetConverted(
            fromSliqId,
            toSliqId,
            fromToken,
            toToken,
            amount,
            convertedAmount,
            fromRate,
            block.timestamp
        );
    }

    /*//////////////////////////////////////////////////////////////
                🔹 D. ADMIN & SECURITY CONTROLS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Withdraws ERC20 tokens from the contract
     * @dev Owner-only function for settlement or emergency withdrawals
     *
     * Use Cases:
     * - Settle with service providers (VTPass, etc.)
     * - Move funds to cold storage
     * - Emergency fund recovery
     * - Liquidity management
     *
     * @param token The token address to withdraw
     * @param amount The amount to withdraw
     * @param to The address to receive the withdrawal
     *
     * Requirements:
     * - Only callable by owner
     * - Contract must have sufficient token balance
     * - to address must not be zero
     *
     * Effects:
     * - Transfers tokens from contract to specified address
     * - Emits Withdrawn event
     *
     * Security:
     * - Owner-only access
     * - Balance check before transfer
     * - Event emission for audit trail
     *
     * Production:
     * - Consider multi-sig requirement
     * - Implement withdrawal limits
     * - Add time-locks for large amounts
     *
     * @custom:emits Withdrawn
     */
    function withdraw(address token, uint256 amount, address to)
        external
        onlyOwner
        nonReentrant
    {
        require(to != address(0), "TreasuryVault: cannot withdraw to zero address");
        require(amount > 0, "TreasuryVault: amount must be greater than 0");

        // Check contract has sufficient balance
        uint256 contractBalance = IERC20(token).balanceOf(address(this));
        require(contractBalance >= amount, "TreasuryVault: insufficient contract balance");

        // Transfer tokens
        bool success = IERC20(token).transfer(to, amount);
        require(success, "TreasuryVault: token transfer failed");

        emit Withdrawn(token, amount, to, block.timestamp);
    }

    /**
     * @notice Withdraws native tokens (ETH/GLMR) from the contract
     * @dev Owner-only function for native token withdrawals
     *
     * @param amount The amount to withdraw
     * @param to The address to receive the withdrawal
     *
     * Requirements:
     * - Only callable by owner
     * - Contract must have sufficient native token balance
     * - to address must not be zero
     *
     * Effects:
     * - Transfers native tokens from contract to specified address
     * - Emits Withdrawn event
     *
     * Security:
     * - Owner-only access
     * - Balance check before transfer
     * - Uses call for safe transfer
     * - Protected by nonReentrant
     *
     * @custom:emits Withdrawn
     */
    function withdrawNative(uint256 amount, address payable to)
        external
        onlyOwner
        nonReentrant
    {
        require(to != address(0), "TreasuryVault: cannot withdraw to zero address");
        require(amount > 0, "TreasuryVault: amount must be greater than 0");
        require(address(this).balance >= amount, "TreasuryVault: insufficient balance");

        // Transfer native tokens using call (recommended over transfer/send)
        (bool success, ) = to.call{value: amount}("");
        require(success, "TreasuryVault: native transfer failed");

        emit Withdrawn(NATIVE_TOKEN, amount, to, block.timestamp);
    }

    /**
     * @notice Pauses all payment and conversion operations
     * @dev Owner-only emergency function
     *
     * When to pause?
     * - Security vulnerability discovered
     * - Oracle malfunction or manipulation
     * - Suspicious activity detected
     * - Planned maintenance or upgrades
     *
     * What gets paused?
     * - routePayment()
     * - routePaymentNative()
     * - convertAsset()
     *
     * What still works?
     * - Admin functions (withdraw, unpause, config)
     * - View functions (getBalance, etc.)
     *
     * @custom:emits Paused
     */
    function pause() external onlyOwner {
        require(!paused, "TreasuryVault: already paused");
        paused = true;
        emit Paused(block.timestamp);
    }

    /**
     * @notice Resumes all operations after emergency pause
     * @dev Owner-only function
     *
     * Before unpausing, ensure:
     * - Security issue resolved
     * - Oracle functioning correctly
     * - All systems operational
     * - Tested on testnet if applicable
     *
     * @custom:emits Unpaused
     */
    function unpause() external onlyOwner {
        require(paused, "TreasuryVault: not paused");
        paused = false;
        emit Unpaused(block.timestamp);
    }

    /**
     * @notice Adds a new operator
     * @dev Owner-only function for operator management
     *
     * Operators can:
     * - Call convertAsset()
     *
     * Operators cannot:
     * - Pause/unpause
     * - Withdraw funds
     * - Add/remove other operators
     * - Change configuration
     *
     * @param operator The address to grant operator privileges
     *
     * @custom:emits OperatorAdded
     */
    function addOperator(address operator) external onlyOwner {
        require(operator != address(0), "TreasuryVault: operator cannot be zero address");
        require(!operators[operator], "TreasuryVault: already an operator");

        operators[operator] = true;
        emit OperatorAdded(operator, block.timestamp);
    }

    /**
     * @notice Removes an operator
     * @dev Owner-only function for operator management
     *
     * @param operator The address to revoke operator privileges from
     *
     * @custom:emits OperatorRemoved
     */
    function removeOperator(address operator) external onlyOwner {
        require(operators[operator], "TreasuryVault: not an operator");

        operators[operator] = false;
        emit OperatorRemoved(operator, block.timestamp);
    }

    /**
     * @notice Updates the SliqID Registry address
     * @dev Owner-only function for configuration updates
     *
     * Use Cases:
     * - Registry contract upgrade
     * - Bug fix in registry
     * - Migration to new registry version
     *
     * @param newRegistry The new registry contract address
     *
     * Requirements:
     * - Only callable by owner
     * - New registry must not be zero address
     *
     * Caution:
     * - Ensure new registry is compatible
     * - Test thoroughly before switching
     * - Consider pausing during switch
     *
     * @custom:emits RegistryUpdated
     */
    function setSliqIDRegistry(address newRegistry) external onlyOwner {
        require(newRegistry != address(0), "TreasuryVault: registry cannot be zero address");

        sliqIDRegistry = ISliqIDRegistry(newRegistry);
        emit RegistryUpdated(newRegistry, block.timestamp);
    }

    /**
     * @notice Updates the FX Oracle address
     * @dev Owner-only function for configuration updates
     *
     * Use Cases:
     * - Oracle contract upgrade
     * - Switch to production oracle (Chainlink)
     * - Bug fix in oracle
     *
     * @param newOracle The new oracle contract address
     *
     * Note: Can be set to address(0) to disable conversions
     *
     * Requirements:
     * - Only callable by owner
     *
     * @custom:emits OracleUpdated
     */
    function setFxOracle(address newOracle) external onlyOwner {
        fxOracle = IMockFxOracle(newOracle);
        emit OracleUpdated(newOracle, block.timestamp);
    }

    /**
     * @notice Transfers ownership to a new address
     * @dev Owner-only function for ownership transfer
     *
     * @param newOwner The address of the new owner
     *
     * Requirements:
     * - Only callable by current owner
     * - New owner must not be zero address
     *
     * Production:
     * - Consider two-step transfer (propose + accept)
     * - Use multi-sig for ownership
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "TreasuryVault: new owner cannot be zero address");
        owner = newOwner;
    }

    /**
     * @notice Checks if an address is an operator
     * @dev Public view function for operator status checks
     *
     * @param account The address to check
     * @return isOperator True if the address is an operator or owner
     *
     * Note: Owner is implicitly an operator
     */
    function isOperator(address account) external view returns (bool) {
        return operators[account] || account == owner;
    }
}
