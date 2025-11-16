// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DeployAll
 * @author SliqPay Development Team
 * @notice Deployment script for all SliqPay contracts on Moonbase Alpha
 * @dev This script deploys the complete contract suite in the correct order
 */

// We must import the Script file from forge-std to get access to vm (Virtual Machine) cheatcodes
import {Script} from "forge-std/Script.sol"; // Vm removed from import
import "../contracts/TreasuryVault.sol";
import "../contracts/mocks/MockSliqIDRegistry.sol";
import "../contracts/mocks/MockFxOracle.sol";
import "../contracts/mocks/MockERC20.sol";

// Import the official console library for robust logging
import "forge-std/console.sol";

/**
 * @notice Main script contract that inherits from the standard forge-std Script.
 * @dev This gives us access to `vm` (for broadcast) and `run()` functionality.
 *
 * NOTE: The manual 'contract Script' definition was removed to prevent conflicts.
 */
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
     */
    function run() public {
        // Get deployer address
        deployer = msg.sender;

        console.log("===========================================");
        console.log("SliqPay Contract Deployment");
        console.log("===========================================");
        console.log("Deployer:", deployer);
        // vm.addr(deployer) is a common cheatcode to get the deployer address, but msg.sender is fine here too.
        console.log("Chain ID:", block.chainid); // Using the official console.log
        console.log("");

        // Start broadcasting transactions
        // vm is now accessible because DeployAll inherits from Script (which imports Vm)
        vm.startBroadcast();

        // Step 1: Deploy MockSliqIDRegistry
        console.log("Step 1: Deploying MockSliqIDRegistry...");
        registry = new MockSliqIDRegistry();
        console.log("MockSliqIDRegistry deployed at:", address(registry));
        console.log("");

        // Step 2: Deploy MockFxOracle
        console.log("Step 2: Deploying MockFxOracle...");
        oracle = new MockFxOracle();
        console.log("MockFxOracle deployed at:", address(oracle));
        console.log("");

        // Step 3: Deploy TreasuryVault
        // NOTE: Deployer will be the owner of the vault and the mocks.
        vault = new TreasuryVault(address(registry), address(oracle));
        console.log("TreasuryVault deployed at:", address(vault));
        console.log("");

        // Step 4: Deploy Mock ERC20 Tokens
        console.log("Step 4: Deploying Mock ERC20 Tokens...");

        mockUSDT = new MockERC20("Mock Tether", "mUSDT", 6);
        console.log("Mock USDT deployed at:", address(mockUSDT));

        mockUSDC = new MockERC20("Mock USD Coin", "mUSDC", 6);
        console.log("Mock USDC deployed at:", address(mockUSDC));

        mockDAI = new MockERC20("Mock DAI", "mDAI", 18);
        console.log("Mock DAI deployed at:", address(mockDAI));
        console.log("");

        // Step 5: Initial Configuration
        console.log("Step 5: Configuring contracts...");
        configureContracts();
        console.log("Configuration complete");
        console.log("");

        // Stop broadcasting
        vm.stopBroadcast();

        // Final Summary
        printDeploymentSummary();
    }

    /**
     * @notice Configures deployed contracts with initial state
     */
    function configureContracts() internal {
        // Configure Oracle with initial rates (all in NGN)
        oracle.setRate(address(mockUSDT), 1500);
        oracle.setRate(address(mockUSDC), 1500);
        oracle.setRate(address(mockDAI), 1485);
        oracle.setRate(address(0), 5000); // Native DEV rate

        console.log("  - Oracle rates configured");

        // Register test SliqIDs
        registry.registerSliqID("alice", deployer);
        console.log("  - Test SliqID registered: alice");

        // Mint test tokens to deployer for testing
        // NOTE: The deployer (msg.sender) is the one running this script.
        mockUSDT.mint(deployer, 10_000 * 10**6);
        mockUSDC.mint(deployer, 10_000 * 10**6);
        mockDAI.mint(deployer, 10_000 * 10**18);
        console.log("  - Test tokens minted to deployer");
    }

    /**
     * @notice Prints deployment summary with all contract addresses
     */
    function printDeploymentSummary() internal view {
        console.log("===========================================");
        console.log("Deployment Summary");
        console.log("===========================================");
        console.log("");
        console.log("Core Contracts:");
        console.log("  MockSliqIDRegistry:", address(registry));
        console.log("  MockFxOracle:      ", address(oracle));
        console.log("  TreasuryVault:     ", address(vault));
        console.log("");
        console.log("Test Tokens:");
        console.log("  Mock USDT:", address(mockUSDT));
        console.log("  Mock USDC:", address(mockUSDC));
        console.log("  Mock DAI: ", address(mockDAI));
        console.log("");
        console.log("Configuration:");
        console.log("  Owner:", deployer);
        console.log("  Network: Moonbase Alpha (Chain ID:", block.chainid, ")");
        console.log("===========================================");
    }
}