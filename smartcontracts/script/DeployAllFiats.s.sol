// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/mocks/MockNGN.sol";
import "../contracts/mocks/MockGHS.sol";
import "../contracts/mocks/MockUSD.sol";
import "../contracts/mocks/MockEUR.sol";

contract DeployAllFiats is Script {
    function run() external {
        vm.startBroadcast();

        MockNGN ngn = new MockNGN();
        console.log("MockNGN deployed at:", address(ngn));

        MockGHS ghs = new MockGHS();
        console.log("MockGHS deployed at:", address(ghs));

        MockUSD usd = new MockUSD();
        console.log("MockUSD deployed at:", address(usd));

        MockEUR eur = new MockEUR();
        console.log("MockEUR deployed at:", address(eur));

        vm.stopBroadcast();
    }
}