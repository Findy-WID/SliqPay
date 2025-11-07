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
 * - Uses SliqIDs (@username) instead of addresses for improved UX
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
     * sliqBalances["@alice"][USDT_ADDRESS] = 1000 * 10^6  (1000 USDT)
     * sliqBalances["@alice"][address(0)] = 2 * 10^18     (2 ETH)
     * sliqBalances["@bob"][USDC_ADDRESS] = 500 * 10^6    (500 USDC)
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

    // TO BE CONTINUED IN NEXT SECTION...
}
