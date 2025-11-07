// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ISliqIDRegistry
 * @author SliqPay Development Team
 * @notice Interface for the SliqID Registry contract that manages user identity mappings
 * @dev This interface defines the core functions for resolving SliqIDs to wallet addresses
 *
 * SliqID is a human-readable identifier (e.g., "\maryam") that maps to a wallet address.
 * This registry serves as the universal identity layer for the SliqPay ecosystem,
 * enabling both Web3 users (with their own wallets) and Web2 users (with custodial wallets)
 * to interact seamlessly.
 */
interface ISliqIDRegistry {
    /**
     * @notice Emitted when a new SliqID is successfully registered
     * @param sliqId The unique SliqID that was registered (e.g., "\showict")
     * @param wallet The Ethereum address associated with this SliqID
     * @param timestamp The block timestamp when registration occurred
     */
    event SliqIDRegistered(
        string indexed sliqId,
        address indexed wallet,
        uint256 timestamp
    );

    /**
     * @notice Emitted when an existing SliqID's wallet address is updated
     * @param sliqId The SliqID that was updated
     * @param oldWallet The previous wallet address
     * @param newWallet The new wallet address
     * @param timestamp The block timestamp when update occurred
     */
    event SliqIDUpdated(
        string indexed sliqId,
        address indexed oldWallet,
        address indexed newWallet,
        uint256 timestamp
    );

    /**
     * @notice Resolves a SliqID to its associated wallet address
     * @dev This is the primary function used by TreasuryVault for payment routing
     *
     * @param sliqId The SliqID to resolve (e.g., "\john")
     * @return wallet The Ethereum address associated with this SliqID
     *
     * Requirements:
     * - SliqID must be registered (non-zero address)
     * - SliqID format should be validated by the implementing contract
     *
     * Example:
     *   resolveAddress("\maryam") => 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
     */
    function resolveAddress(string memory sliqId)
        external
        view
        returns (address wallet);

    /**
     * @notice Checks if a SliqID is registered in the system
     * @dev Useful for validation before attempting operations
     *
     * @param sliqId The SliqID to check
     * @return registered True if the SliqID exists and has a non-zero wallet address
     *
     * This function helps prevent failed transactions by allowing pre-checks:
     * - TreasuryVault can validate recipient before processing payment
     * - Frontend can provide real-time feedback during user input
     * - Backend can verify SliqIDs during custodial wallet creation
     */
    function isSliqIDRegistered(string memory sliqId)
        external
        view
        returns (bool registered);

    /**
     * @notice Retrieves the SliqID associated with a wallet address (reverse lookup)
     * @dev Optional function for bidirectional mapping
     *
     * @param wallet The Ethereum address to lookup
     * @return sliqId The SliqID associated with this wallet, or empty string if none
     *
     * Note: This may not be implemented in all registry versions.
     * Useful for displaying user identifiers in UIs when only address is known.
     */
    function getSliqIDByAddress(address wallet)
        external
        view
        returns (string memory sliqId);
}
