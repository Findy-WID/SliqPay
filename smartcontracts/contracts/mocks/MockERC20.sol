// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MockERC20
 * @author SliqPay Development Team
 * @notice Simple ERC20 implementation for testing TreasuryVault
 * @dev Minimal ERC20 with minting capability for test scenarios
 *
 * This mock token allows:
 * - Minting unlimited tokens for testing
 * - Standard ERC20 operations (transfer, approve, transferFrom)
 * - Easy setup of test scenarios with multiple tokens
 *
 * Production Considerations:
 * - Real tokens would have supply caps
 * - Access control on minting
 * - Additional features (burn, pause, etc.)
 * - Integration with actual stablecoins (USDT, USDC, DAI)
 */
contract MockERC20 {
    /*//////////////////////////////////////////////////////////////
                           STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    /// @dev Token name (e.g., "Mock USDT")
    string public name;

    /// @dev Token symbol (e.g., "mUSDT")
    string public symbol;

    /// @dev Token decimals (typically 6 for USDT, 18 for most others)
    uint8 public decimals;

    /// @dev Total token supply
    uint256 public totalSupply;

    /// @dev Balance of each address
    mapping(address => uint256) public balanceOf;

    /// @dev Allowance mapping: owner => spender => amount
    mapping(address => mapping(address => uint256)) public allowance;

    /*//////////////////////////////////////////////////////////////
                              EVENTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Emitted when tokens are transferred
     * @param from The address tokens are transferred from
     * @param to The address tokens are transferred to
     * @param value The amount of tokens transferred
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @notice Emitted when allowance is set
     * @param owner The address granting the allowance
     * @param spender The address receiving the allowance
     * @param value The amount of tokens approved
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /*//////////////////////////////////////////////////////////////
                             CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Creates a new mock ERC20 token
     * @dev Initializes token with name, symbol, and decimals
     *
     * @param _name Token name (e.g., "Mock Tether")
     * @param _symbol Token symbol (e.g., "mUSDT")
     * @param _decimals Token decimals (e.g., 6 for USDT, 18 for DAI)
     *
     * Example:
     * ```solidity
     * // Create a mock USDT (6 decimals)
     * MockERC20 usdt = new MockERC20("Mock Tether", "mUSDT", 6);
     *
     * // Create a mock DAI (18 decimals)
     * MockERC20 dai = new MockERC20("Mock DAI", "mDAI", 18);
     * ```
     */
    constructor(string memory _name, string memory _symbol, uint8 _decimals) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
    }

    /*//////////////////////////////////////////////////////////////
                          ERC20 FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Transfers tokens from caller to recipient
     * @dev Standard ERC20 transfer
     *
     * @param to The address to transfer tokens to
     * @param value The amount of tokens to transfer
     * @return success True if transfer succeeded
     *
     * Requirements:
     * - Caller must have sufficient balance
     * - Recipient cannot be zero address
     *
     * Effects:
     * - Decreases caller's balance by value
     * - Increases recipient's balance by value
     * - Emits Transfer event
     */
    function transfer(address to, uint256 value) external returns (bool success) {
        require(to != address(0), "MockERC20: transfer to zero address");
        require(balanceOf[msg.sender] >= value, "MockERC20: insufficient balance");

        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;

        emit Transfer(msg.sender, to, value);
        return true;
    }

    /**
     * @notice Approves spender to transfer tokens on behalf of caller
     * @dev Standard ERC20 approve
     *
     * @param spender The address authorized to spend tokens
     * @param value The maximum amount spender can transfer
     * @return success True if approval succeeded
     *
     * Effects:
     * - Sets allowance[caller][spender] = value
     * - Emits Approval event
     *
     * Example:
     * ```solidity
     * // Allow TreasuryVault to spend 1000 tokens
     * token.approve(treasuryVaultAddress, 1000 * 10**6);  // 1000 USDT (6 decimals)
     * ```
     */
    function approve(address spender, uint256 value) external returns (bool success) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    /**
     * @notice Transfers tokens from one address to another using allowance
     * @dev Standard ERC20 transferFrom
     *
     * @param from The address to transfer tokens from
     * @param to The address to transfer tokens to
     * @param value The amount of tokens to transfer
     * @return success True if transfer succeeded
     *
     * Requirements:
     * - from address must have sufficient balance
     * - Caller must have sufficient allowance from 'from' address
     * - to address cannot be zero address
     *
     * Effects:
     * - Decreases from's balance by value
     * - Increases to's balance by value
     * - Decreases caller's allowance by value
     * - Emits Transfer event
     *
     * This is how TreasuryVault transfers user tokens:
     * 1. User approves TreasuryVault for amount
     * 2. TreasuryVault calls transferFrom(user, vault, amount)
     * 3. Tokens move from user to vault
     */
    function transferFrom(address from, address to, uint256 value)
        external
        returns (bool success)
    {
        require(to != address(0), "MockERC20: transfer to zero address");
        require(balanceOf[from] >= value, "MockERC20: insufficient balance");
        require(allowance[from][msg.sender] >= value, "MockERC20: insufficient allowance");

        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;

        emit Transfer(from, to, value);
        return true;
    }

    /*//////////////////////////////////////////////////////////////
                         TESTING UTILITIES
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Mints new tokens to an address
     * @dev Test utility - in production, minting would be restricted
     *
     * @param to The address to mint tokens to
     * @param value The amount of tokens to mint
     *
     * Effects:
     * - Increases total supply by value
     * - Increases recipient's balance by value
     * - Emits Transfer event from address(0)
     *
     * Example:
     * ```solidity
     * // Give Alice 10,000 USDT for testing
     * usdt.mint(alice, 10000 * 10**6);  // 10,000 USDT (6 decimals)
     * ```
     */
    function mint(address to, uint256 value) external {
        require(to != address(0), "MockERC20: mint to zero address");

        totalSupply += value;
        balanceOf[to] += value;

        emit Transfer(address(0), to, value);
    }

    /**
     * @notice Burns tokens from an address
     * @dev Test utility for simulating token burns
     *
     * @param from The address to burn tokens from
     * @param value The amount of tokens to burn
     *
     * Requirements:
     * - from address must have sufficient balance
     *
     * Effects:
     * - Decreases total supply by value
     * - Decreases from's balance by value
     * - Emits Transfer event to address(0)
     */
    function burn(address from, uint256 value) external {
        require(balanceOf[from] >= value, "MockERC20: insufficient balance to burn");

        totalSupply -= value;
        balanceOf[from] -= value;

        emit Transfer(from, address(0), value);
    }

    /**
     * @notice Batch mint tokens to multiple addresses
     * @dev Utility for efficient test setup
     *
     * @param recipients Array of addresses to receive tokens
     * @param amounts Array of corresponding amounts
     *
     * Requirements:
     * - Arrays must have equal length
     *
     * Example:
     * ```solidity
     * address[] memory users = new address[](3);
     * users[0] = alice;
     * users[1] = bob;
     * users[2] = charlie;
     *
     * uint256[] memory amounts = new uint256[](3);
     * amounts[0] = 1000 * 10**6;  // 1000 USDT each
     * amounts[1] = 1000 * 10**6;
     * amounts[2] = 1000 * 10**6;
     *
     * usdt.batchMint(users, amounts);
     * ```
     */
    function batchMint(address[] memory recipients, uint256[] memory amounts) external {
        require(
            recipients.length == amounts.length,
            "MockERC20: array length mismatch"
        );

        for (uint256 i = 0; i < recipients.length; i++) {
            if (recipients[i] != address(0)) {
                totalSupply += amounts[i];
                balanceOf[recipients[i]] += amounts[i];
                emit Transfer(address(0), recipients[i], amounts[i]);
            }
        }
    }
}
