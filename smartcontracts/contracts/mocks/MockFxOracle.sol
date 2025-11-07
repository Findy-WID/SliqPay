// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IMockFxOracle.sol";

/**
 * @title MockFxOracle
 * @author SliqPay Development Team
 * @notice Mock FX Oracle for testing token conversion rates
 * @dev Provides exchange rates for testing TreasuryVault's conversion functionality
 *
 * This mock oracle simulates what would be a Chainlink Price Feed in production.
 * It allows manual setting of exchange rates for testing purposes.
 *
 * Rate Format:
 * - Rates represent: 1 token unit = X base currency units (NGN)
 * - Example: setRate(USDT, 1500) means 1 USDT = ₦1,500
 * - Rates should account for token decimals in actual implementation
 *
 * Production Considerations:
 * - Replace with Chainlink Price Feeds or Band Protocol
 * - Implement time-weighted average price (TWAP)
 * - Add staleness checks for rate updates
 * - Include circuit breakers for extreme price movements
 */
contract MockFxOracle is IMockFxOracle {
    /*//////////////////////////////////////////////////////////////
                           STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    /// @dev Maps token address to its exchange rate in NGN
    mapping(address => uint256) private tokenRates;

    /// @dev Owner address for admin functions
    address public owner;

    /// @dev Default rate precision (can be configured)
    uint256 public constant RATE_PRECISION = 1e18;

    /*//////////////////////////////////////////////////////////////
                              MODIFIERS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Restricts function access to contract owner only
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "MockFxOracle: caller is not owner");
        _;
    }

    /*//////////////////////////////////////////////////////////////
                             CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Initializes the mock FX oracle
     * @dev Sets the deployer as owner and optionally initializes common token rates
     */
    constructor() {
        owner = msg.sender;

        // Pre-populate some common rates for convenience (all in NGN)
        // These can be updated via setRate()
        // Note: Using 1500 as example rate for stablecoins

        // Stablecoins typically track 1:1 with USD
        // If 1 USD = ₦1,500, then 1 USDT = ₦1,500
        // tokenRates[USDT] = 1500;  // Will be set externally
        // tokenRates[USDC] = 1500;
        // tokenRates[DAI] = 1500;
    }

    /*//////////////////////////////////////////////////////////////
                        ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Sets or updates the exchange rate for a token
     * @inheritdoc IMockFxOracle
     *
     * @param token The address of the ERC20 token (use address(0) for native token)
     * @param rateInNGN The exchange rate in NGN
     *
     * Requirements:
     * - Only callable by owner
     * - Rate must be greater than 0
     *
     * Effects:
     * - Updates the token's exchange rate
     * - Emits RateUpdated event
     *
     * Example:
     * ```solidity
     * // Set USDT rate: 1 USDT = ₦1,500
     * oracle.setRate(usdtAddress, 1500);
     *
     * // Set native DEV token rate: 1 DEV = ₦5,000
     * oracle.setRate(address(0), 5000);
     * ```
     */
    function setRate(address token, uint256 rateInNGN) external override onlyOwner {
        require(rateInNGN > 0, "MockFxOracle: rate must be positive");

        uint256 oldRate = tokenRates[token];
        tokenRates[token] = rateInNGN;

        emit RateUpdated(token, oldRate, rateInNGN, block.timestamp);
    }

    /**
     * @notice Batch update multiple token rates at once
     * @dev Utility function for efficient rate updates
     *
     * @param tokens Array of token addresses
     * @param rates Array of corresponding rates in NGN
     *
     * Requirements:
     * - Only callable by owner
     * - Arrays must have equal length
     * - All rates must be greater than 0
     *
     * This is useful for:
     * - Initial setup of multiple token rates
     * - Periodic batch updates from off-chain price feeds
     * - Testing scenarios with multiple tokens
     */
    function batchSetRates(address[] memory tokens, uint256[] memory rates)
        external
        onlyOwner
    {
        require(
            tokens.length == rates.length,
            "MockFxOracle: array length mismatch"
        );

        for (uint256 i = 0; i < tokens.length; i++) {
            require(rates[i] > 0, "MockFxOracle: rate must be positive");

            uint256 oldRate = tokenRates[tokens[i]];
            tokenRates[tokens[i]] = rates[i];

            emit RateUpdated(tokens[i], oldRate, rates[i], block.timestamp);
        }
    }

    /*//////////////////////////////////////////////////////////////
                           VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Retrieves the current exchange rate for a token
     * @inheritdoc IMockFxOracle
     *
     * @param token The address of the token
     * @return rate The current exchange rate in NGN (returns 0 if not set)
     *
     * Usage:
     * ```solidity
     * uint256 usdtRate = oracle.getRate(usdtAddress);
     * if (usdtRate == 0) {
     *     revert("Token not supported");
     * }
     * ```
     */
    function getRate(address token) external view override returns (uint256 rate) {
        return tokenRates[token];
    }

    /**
     * @notice Checks if a token has a registered exchange rate
     * @inheritdoc IMockFxOracle
     *
     * @param token The token address to check
     * @return supported True if the token has a non-zero rate
     *
     * This allows TreasuryVault to validate tokens before conversion:
     * ```solidity
     * require(
     *     oracle.isTokenSupported(fromToken) && oracle.isTokenSupported(toToken),
     *     "TreasuryVault: unsupported token pair"
     * );
     * ```
     */
    function isTokenSupported(address token)
        external
        view
        override
        returns (bool supported)
    {
        return tokenRates[token] > 0;
    }

    /**
     * @notice Calculates the converted amount between two tokens
     * @inheritdoc IMockFxOracle
     *
     * @param fromToken Source token address
     * @param toToken Destination token address
     * @param amount Amount of source tokens to convert
     * @return convertedAmount The equivalent amount in destination tokens
     *
     * Conversion Formula:
     * ```
     * convertedAmount = (amount * getRate(fromToken)) / getRate(toToken)
     * ```
     *
     * Example:
     * - Convert 100 USDT to USDC
     * - USDT rate = 1500 NGN, USDC rate = 1500 NGN
     * - convertedAmount = (100 * 1500) / 1500 = 100 USDC
     *
     * Example with different rates:
     * - Convert 100 USDT to DAI
     * - USDT rate = 1500 NGN, DAI rate = 1485 NGN (DAI slightly depegged)
     * - convertedAmount = (100 * 1500) / 1485 ≈ 101.01 DAI
     *
     * Requirements:
     * - Both tokens must have non-zero rates
     * - Destination token rate must be non-zero (prevent division by zero)
     *
     * Note: This simplified version doesn't account for:
     * - Token decimal differences (e.g., USDC has 6 decimals, DAI has 18)
     * - Slippage or fees
     * - Price impact for large conversions
     * Production implementation should include these considerations.
     */
    function convertAmount(
        address fromToken,
        address toToken,
        uint256 amount
    ) external view override returns (uint256 convertedAmount) {
        uint256 fromRate = tokenRates[fromToken];
        uint256 toRate = tokenRates[toToken];

        require(fromRate > 0, "MockFxOracle: source token not supported");
        require(toRate > 0, "MockFxOracle: destination token not supported");

        // Conversion formula: (amount * fromRate) / toRate
        // This maintains precision by doing multiplication first
        convertedAmount = (amount * fromRate) / toRate;

        return convertedAmount;
    }

    /*//////////////////////////////////////////////////////////////
                        UTILITY FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Transfers ownership to a new address
     * @dev Simple ownership transfer for testing
     *
     * @param newOwner The address of the new owner
     *
     * Requirements:
     * - Only callable by current owner
     * - New owner cannot be zero address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "MockFxOracle: new owner is zero address");
        owner = newOwner;
    }

    /**
     * @notice Gets all rates for an array of tokens (batch query)
     * @dev Utility function for efficient multi-token rate queries
     *
     * @param tokens Array of token addresses to query
     * @return rates Array of corresponding rates
     *
     * This is useful for:
     * - Dashboard displaying multiple token prices
     * - Batch validation before multi-token operations
     * - Analytics and reporting
     */
    function getBatchRates(address[] memory tokens)
        external
        view
        returns (uint256[] memory rates)
    {
        rates = new uint256[](tokens.length);

        for (uint256 i = 0; i < tokens.length; i++) {
            rates[i] = tokenRates[tokens[i]];
        }

        return rates;
    }
}
