// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/ISliqIDRegistry.sol";

/**
 * @title MockSliqIDRegistry
 * @author SliqPay Development Team
 * @notice Mock implementation of SliqID Registry for testing purposes
 * @dev This contract provides a simplified registry for development and testing
 *
 * This mock version allows:
 * - Easy registration of SliqIDs without complex validation
 * - Direct manipulation of mappings for test scenarios
 * - Bidirectional lookup (SliqID <-> Address)
 *
 * Production Version Differences:
 * - Would have stricter SliqID format validation
 * - Would include access control (only authorized backend can register)
 * - Would prevent duplicate SliqIDs (case-insensitive)
 * - Would include email/phone verification flows
 */
contract MockSliqIDRegistry is ISliqIDRegistry {
    /*//////////////////////////////////////////////////////////////
                           STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    /// @dev Maps SliqID to wallet address (e.g., "\maryam" => 0x123...)
    mapping(string => address) private sliqIdToWallet;

    /// @dev Reverse mapping: wallet address to SliqID
    mapping(address => string) private walletToSliqId;

    /// @dev Owner address for admin functions
    address public owner;

    /*//////////////////////////////////////////////////////////////
                              MODIFIERS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Restricts function access to contract owner only
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "MockSliqIDRegistry: caller is not owner");
        _;
    }

    /*//////////////////////////////////////////////////////////////
                             CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Initializes the mock registry
     * @dev Sets the deployer as the owner
     */
    constructor() {
        owner = msg.sender;
    }

    /*//////////////////////////////////////////////////////////////
                          PUBLIC FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Registers a new SliqID and maps it to a wallet address
     * @dev For testing purposes, anyone can call this (production would restrict access)
     *
     * @param sliqId The unique SliqID to register (e.g., "\john")
     * @param wallet The Ethereum address to associate with this SliqID
     *
     * Requirements:
     * - SliqID must not be empty
     * - Wallet address must not be zero address
     * - SliqID must not already be registered
     *
     * Effects:
     * - Creates bidirectional mapping between SliqID and wallet
     * - Emits SliqIDRegistered event
     *
     * Example:
     * ```solidity
     * registry.registerSliqID("\alice", 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb);
     * ```
     */
    function registerSliqID(string memory sliqId, address wallet) external {
        require(bytes(sliqId).length > 0, "MockSliqIDRegistry: empty SliqID");
        require(wallet != address(0), "MockSliqIDRegistry: zero address");
        require(
            sliqIdToWallet[sliqId] == address(0),
            "MockSliqIDRegistry: SliqID already registered"
        );

        // Create bidirectional mapping
        sliqIdToWallet[sliqId] = wallet;
        walletToSliqId[wallet] = sliqId;

        emit SliqIDRegistered(sliqId, wallet, block.timestamp);
    }

    /**
     * @notice Updates the wallet address associated with an existing SliqID
     * @dev Useful for testing wallet migration scenarios
     *
     * @param sliqId The SliqID to update
     * @param newWallet The new wallet address
     *
     * Requirements:
     * - SliqID must already be registered
     * - New wallet must not be zero address
     *
     * Effects:
     * - Updates the SliqID to wallet mapping
     * - Updates the reverse mapping
     * - Emits SliqIDUpdated event
     */
    function updateSliqID(string memory sliqId, address newWallet) external {
        address oldWallet = sliqIdToWallet[sliqId];
        require(oldWallet != address(0), "MockSliqIDRegistry: SliqID not registered");
        require(newWallet != address(0), "MockSliqIDRegistry: zero address");

        // Update mappings
        sliqIdToWallet[sliqId] = newWallet;
        delete walletToSliqId[oldWallet];
        walletToSliqId[newWallet] = sliqId;

        emit SliqIDUpdated(sliqId, oldWallet, newWallet, block.timestamp);
    }

    /**
     * @notice Removes a SliqID registration (testing utility)
     * @dev Only owner can remove registrations to prevent abuse
     *
     * @param sliqId The SliqID to remove
     *
     * This function is useful for:
     * - Cleaning up test data between test runs
     * - Simulating account deletion scenarios
     * - Resetting state during development
     */
    function removeSliqID(string memory sliqId) external onlyOwner {
        address wallet = sliqIdToWallet[sliqId];
        require(wallet != address(0), "MockSliqIDRegistry: SliqID not registered");

        delete sliqIdToWallet[sliqId];
        delete walletToSliqId[wallet];
    }

    /*//////////////////////////////////////////////////////////////
                           VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Resolves a SliqID to its associated wallet address
     * @inheritdoc ISliqIDRegistry
     *
     * @param sliqId The SliqID to resolve
     * @return wallet The associated wallet address (or address(0) if not found)
     *
     * This is the primary function used by TreasuryVault for payment routing.
     * It allows sending payments to human-readable identifiers instead of addresses.
     */
    function resolveAddress(string memory sliqId)
        external
        view
        override
        returns (address wallet)
    {
        return sliqIdToWallet[sliqId];
    }

    /**
     * @notice Checks if a SliqID is registered
     * @inheritdoc ISliqIDRegistry
     *
     * @param sliqId The SliqID to check
     * @return registered True if SliqID exists and has a valid wallet
     *
     * Pre-validation function to prevent failed transactions:
     * - TreasuryVault can check before processing payment
     * - Frontend can validate user input in real-time
     * - Backend can verify SliqIDs before operations
     */
    function isSliqIDRegistered(string memory sliqId)
        external
        view
        override
        returns (bool registered)
    {
        return sliqIdToWallet[sliqId] != address(0);
    }

    /**
     * @notice Retrieves the SliqID associated with a wallet (reverse lookup)
     * @inheritdoc ISliqIDRegistry
     *
     * @param wallet The wallet address to lookup
     * @return sliqId The associated SliqID (or empty string if none)
     *
     * Useful for displaying user identifiers in UIs:
     * - Show "\alice" instead of "0x742d...5f0bEb"
     * - Lookup sender's SliqID when displaying transaction history
     * - Verify wallet ownership of SliqID
     */
    function getSliqIDByAddress(address wallet)
        external
        view
        override
        returns (string memory sliqId)
    {
        return walletToSliqId[wallet];
    }

    /*//////////////////////////////////////////////////////////////
                         TESTING UTILITIES
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Batch register multiple SliqIDs (testing utility)
     * @dev Useful for setting up test scenarios quickly
     *
     * @param sliqIds Array of SliqIDs to register
     * @param wallets Array of corresponding wallet addresses
     *
     * Requirements:
     * - Arrays must have equal length
     * - Each SliqID must not be already registered
     *
     * Example:
     * ```solidity
     * string[] memory ids = new string[](2);
     * ids[0] = "\alice";
     * ids[1] = "\bob";
     *
     * address[] memory wallets = new address[](2);
     * wallets[0] = address(0x1);
     * wallets[1] = address(0x2);
     *
     * registry.batchRegister(ids, wallets);
     * ```
     */
    function batchRegister(string[] memory sliqIds, address[] memory wallets)
        external
        onlyOwner
    {
        require(
            sliqIds.length == wallets.length,
            "MockSliqIDRegistry: array length mismatch"
        );

        for (uint256 i = 0; i < sliqIds.length; i++) {
            if (sliqIdToWallet[sliqIds[i]] == address(0) && wallets[i] != address(0)) {
                sliqIdToWallet[sliqIds[i]] = wallets[i];
                walletToSliqId[wallets[i]] = sliqIds[i];
                emit SliqIDRegistered(sliqIds[i], wallets[i], block.timestamp);
            }
        }
    }
}
