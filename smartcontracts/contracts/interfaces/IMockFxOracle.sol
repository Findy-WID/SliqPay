// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IMockFxOracle
 * @author SliqPay Development Team
 * @notice Interface for the FX (Foreign Exchange) Oracle that provides token conversion rates
 * @dev This is a simplified oracle interface for hackathon/testing purposes
 *
 * In production, this would be replaced with Chainlink Price Feeds or similar oracle solution.
 * For the MVP, this mock oracle allows testing of multi-token conversions and demonstrates
 * how the TreasuryVault handles cross-asset routing.
 *
 * Conversion Flow Example:
 * 1. User wants to send 100 USDT but recipient prefers USDC
 * 2. TreasuryVault calls getRate(USDT) => 1500 (representing ₦1,500 per USDT)
 * 3. TreasuryVault calls getRate(USDC) => 1500 (representing ₦1,500 per USDC)
 * 4. Since rates are equal, 100 USDT => 100 USDC (1:1 conversion)
 * 5. Vault debits sender's USDT, credits recipient's USDC
 */
interface IMockFxOracle {
    /**
     * @notice Emitted when a token's exchange rate is updated
     * @param token The ERC20 token address whose rate was updated
     * @param oldRate The previous rate in base currency (NGN)
     * @param newRate The new rate in base currency (NGN)
     * @param timestamp The block timestamp when rate was updated
     */
    event RateUpdated(
        address indexed token,
        uint256 oldRate,
        uint256 newRate,
        uint256 timestamp
    );

    /**
     * @notice Retrieves the current exchange rate for a given token
     * @dev Returns the rate in base currency units (typically NGN cents for precision)
     *
     * @param token The address of the ERC20 token (use address(0) for native token)
     * @return rate The current exchange rate in base currency
     *
     * Rate Format:
     * - Rates are typically expressed in smallest currency units for precision
     * - Example: If 1 USDT = ₦1,500, rate might be 150000 (in kobo) or 1500 (in naira)
     * - The rate represents: 1 token unit = X base currency units
     *
     * Usage by TreasuryVault:
     * ```solidity
     * uint256 usdtRate = fxOracle.getRate(usdtAddress);  // e.g., 1500
     * uint256 usdcRate = fxOracle.getRate(usdcAddress);  // e.g., 1500
     * uint256 convertedAmount = (amount * usdtRate) / usdcRate;
     * ```
     *
     * Requirements:
     * - Must return non-zero rate for supported tokens
     * - Should revert or return 0 for unsupported tokens
     * - Rates should be reasonably up-to-date (implementation-specific)
     */
    function getRate(address token) external view returns (uint256 rate);

    /**
     * @notice Sets or updates the exchange rate for a token
     * @dev Admin function for managing token rates in the mock oracle
     *
     * @param token The address of the ERC20 token
     * @param rateInNGN The new exchange rate in NGN (or base currency)
     *
     * Requirements:
     * - Only callable by oracle admin/owner
     * - Rate must be greater than 0
     * - Token address should be valid ERC20 or address(0) for native
     *
     * Security Considerations:
     * - In production, this would be replaced with Chainlink or similar decentralized oracle
     * - Current implementation is centralized for testing/demo purposes
     * - Rate manipulation could affect user balances in conversion operations
     *
     * Example Usage:
     * ```solidity
     * // Set USDT rate: 1 USDT = ₦1,500
     * oracle.setRate(usdtAddress, 1500);
     *
     * // Set native token rate: 1 DEV = ₦5,000
     * oracle.setRate(address(0), 5000);
     * ```
     *
     * Emits: RateUpdated
     */
    function setRate(address token, uint256 rateInNGN) external;

    /**
     * @notice Checks if a token has a registered exchange rate
     * @dev Useful for validation before attempting conversions
     *
     * @param token The token address to check
     * @return supported True if the token has a non-zero rate
     *
     * This prevents failed conversions by allowing pre-checks:
     * - TreasuryVault can validate both tokens support conversion
     * - Frontend can show which assets are convertible
     * - Backend can update supported token lists
     */
    function isTokenSupported(address token)
        external
        view
        returns (bool supported);

    /**
     * @notice Calculates the conversion amount between two tokens
     * @dev Helper function that encapsulates the conversion logic
     *
     * @param fromToken Source token address
     * @param toToken Destination token address
     * @param amount Amount of source tokens to convert
     * @return convertedAmount The equivalent amount in destination tokens
     *
     * Conversion Formula:
     * convertedAmount = (amount * getRate(fromToken)) / getRate(toToken)
     *
     * Example:
     * - Convert 100 USDT to USDC
     * - USDT rate = 1500, USDC rate = 1500
     * - convertedAmount = (100 * 1500) / 1500 = 100 USDC
     *
     * Requirements:
     * - Both tokens must be supported
     * - Destination token rate must be non-zero (to prevent division by zero)
     * - Should account for token decimal differences (implementation-specific)
     */
    function convertAmount(
        address fromToken,
        address toToken,
        uint256 amount
    ) external view returns (uint256 convertedAmount);
}
