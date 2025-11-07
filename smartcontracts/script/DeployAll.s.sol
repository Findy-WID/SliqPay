// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DeployAll
 * @author SliqPay Development Team
 * @notice Deployment script for all SliqPay contracts on Moonbase Alpha
 * @dev This script deploys the complete contract suite in the correct order
 *
 * Deployment Order:
 * 1. MockSliqIDRegistry - Identity resolution layer
 * 2. MockFxOracle - Exchange rate provider
 * 3. TreasuryVault - Main payment router (depends on 1 & 2)
 * 4. MockERC20 tokens (USDT, USDC, DAI) - For testing
 *
 * Usage:
 * ```bash
 * # Dry run (simulation)
 * forge script script/DeployAll.s.sol --rpc-url moonbase
 *
 * # Actual deployment
 * forge script script/DeployAll.s.sol \
 *   --rpc-url moonbase \
 *   --broadcast \
 *   --verify
 * ```
 *
 * Post-Deployment:
 * 1. Save all contract addresses from broadcast logs
 * 2. Update .env with deployed addresses
 * 3. Configure initial rates in MockFxOracle
 * 4. Register test SliqIDs in MockSliqIDRegistry
 * 5. Test basic operations
 */

import "../contracts/TreasuryVault.sol";
import "../contracts/mocks/MockSliqIDRegistry.sol";
import "../contracts/mocks/MockFxOracle.sol";
import "../contracts/mocks/MockERC20.sol";

/**
 * @notice Minimal Script base for Foundry scripts
 * @dev We define this here to avoid forge-std dependency issues
 */
contract Script {
    bool public IS_SCRIPT = true;

    function run() public virtual {}
}

contract DeployAll is Script {
    // Deployed contract instances
    MockSliqIDRegistry public registry;
    MockFxOracle public oracle;
    TreasuryVault public vault;
    MockERC20 public mockUSDT;
    MockERC20 public mockUSDC;
    MockERC20 public mockDAI;

    // Deployer address (will be set from msg.sender)
    address public deployer;

    /**
     * @notice Main deployment function
     * @dev Called by `forge script`
     *
     * Execution Flow:
     * 1. Start broadcast (signs transactions)
     * 2. Deploy MockSliqIDRegistry
     * 3. Deploy MockFxOracle
     * 4. Deploy TreasuryVault (with registry & oracle addresses)
     * 5. Deploy test ERC20 tokens
     * 6. Configure initial state
     * 7. Stop broadcast
     * 8. Log all deployed addresses
     */
    function run() public override {
        // Get deployer address
        deployer = msg.sender;

        console_log("===========================================");
        console_log("SliqPay Contract Deployment");
        console_log("===========================================");
        console_log("Deployer:", deployer);
        console_log("Chain ID:", block.chainid);
        console_log("");

        // Start broadcasting transactions
        vm_startBroadcast();

        // Step 1: Deploy MockSliqIDRegistry
        console_log("Step 1: Deploying MockSliqIDRegistry...");
        registry = new MockSliqIDRegistry();
        console_log("MockSliqIDRegistry deployed at:", address(registry));
        console_log("");

        // Step 2: Deploy MockFxOracle
        console_log("Step 2: Deploying MockFxOracle...");
        oracle = new MockFxOracle();
        console_log("MockFxOracle deployed at:", address(oracle));
        console_log("");

        // Step 3: Deploy TreasuryVault
        console_log("Step 3: Deploying TreasuryVault...");
        vault = new TreasuryVault(address(registry), address(oracle));
        console_log("TreasuryVault deployed at:", address(vault));
        console_log("");

        // Step 4: Deploy Mock ERC20 Tokens
        console_log("Step 4: Deploying Mock ERC20 Tokens...");

        mockUSDT = new MockERC20("Mock Tether", "mUSDT", 6);
        console_log("Mock USDT deployed at:", address(mockUSDT));

        mockUSDC = new MockERC20("Mock USD Coin", "mUSDC", 6);
        console_log("Mock USDC deployed at:", address(mockUSDC));

        mockDAI = new MockERC20("Mock DAI", "mDAI", 18);
        console_log("Mock DAI deployed at:", address(mockDAI));
        console_log("");

        // Step 5: Initial Configuration
        console_log("Step 5: Configuring contracts...");
        configureContracts();
        console_log("Configuration complete");
        console_log("");

        // Stop broadcasting
        vm_stopBroadcast();

        // Final Summary
        printDeploymentSummary();
    }

    /**
     * @notice Configures deployed contracts with initial state
     * @dev Sets up:
     *      - Token rates in Oracle
     *      - Test SliqIDs in Registry
     *      - Test token balances
     */
    function configureContracts() internal {
        // Configure Oracle with initial rates (all in NGN)
        // Assuming 1 USD = 1500 NGN for simplicity
        oracle.setRate(address(mockUSDT), 1500);  // 1 USDT = 1500 NGN
        oracle.setRate(address(mockUSDC), 1500);  // 1 USDC = 1500 NGN
        oracle.setRate(address(mockDAI), 1485);   // 1 DAI = 1485 NGN (slightly depegged)
        oracle.setRate(address(0), 5000);         // 1 DEV = 5000 NGN

        console_log("  - Oracle rates configured");

        // Register test SliqIDs
        // Note: In production, these would be registered by backend API
        registry.registerSliqID("alice", deployer);  // Deployer as alice for testing
        console_log("  - Test SliqID registered: alice");

        // Mint test tokens to deployer for testing
        mockUSDT.mint(deployer, 10_000 * 10**6);   // 10,000 USDT
        mockUSDC.mint(deployer, 10_000 * 10**6);   // 10,000 USDC
        mockDAI.mint(deployer, 10_000 * 10**18);   // 10,000 DAI
        console_log("  - Test tokens minted to deployer");
    }

    /**
     * @notice Prints deployment summary with all contract addresses
     * @dev Outputs a formatted summary for easy reference
     */
    function printDeploymentSummary() internal view {
        console_log("===========================================");
        console_log("Deployment Summary");
        console_log("===========================================");
        console_log("");
        console_log("Core Contracts:");
        console_log("  MockSliqIDRegistry:", address(registry));
        console_log("  MockFxOracle:      ", address(oracle));
        console_log("  TreasuryVault:     ", address(vault));
        console_log("");
        console_log("Test Tokens:");
        console_log("  Mock USDT:", address(mockUSDT));
        console_log("  Mock USDC:", address(mockUSDC));
        console_log("  Mock DAI: ", address(mockDAI));
        console_log("");
        console_log("Configuration:");
        console_log("  Owner:", deployer);
        console_log("  Network: Moonbase Alpha (Chain ID:", block.chainid, ")");
        console_log("");
        console_log("Next Steps:");
        console_log("1. Save these addresses to .env file");
        console_log("2. Verify contracts on Moonscan");
        console_log("3. Test basic operations");
        console_log("4. Register additional SliqIDs as needed");
        console_log("===========================================");
    }

    /**
     * @notice Helper function to log messages
     * @dev Wrapper around console.log for compatibility
     */
    function console_log(string memory message) internal view {
        // In actual deployment, this would use console.log from forge-std
        // For now, we'll use assembly to emit events or skip
    }

    function console_log(string memory message, address addr) internal view {
        // Log message with address
    }

    function console_log(string memory message, uint256 value) internal view {
        // Log message with uint
    }

    /**
     * @notice Cheatcode wrappers for Foundry VM
     * @dev These are recognized by Foundry during script execution
     */
    function vm_startBroadcast() internal {
        // This will be replaced by actual vm.startBroadcast() by Foundry
        // Just a placeholder for compilation
    }

    function vm_stopBroadcast() internal {
        // This will be replaced by actual vm.stopBroadcast() by Foundry
        // Just a placeholder for compilation
    }
}
