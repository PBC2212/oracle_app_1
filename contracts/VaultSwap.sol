// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title VaultSwap
 * @dev Handles RWA → Stable token swaps with a configurable fee. Emits SwapRequested events.
 */
contract VaultSwap {
    address public admin;
    IERC20 public rwaToken;
    IERC20 public stableToken;
    uint256 public feeBasisPoints = 25; // 0.25% fee

    event SwapRequested(address indexed user, uint256 amountAfterFee, uint256 fee);

    constructor(address _rwaToken, address _stableToken) {
        admin = msg.sender;
        rwaToken = IERC20(_rwaToken);
        stableToken = IERC20(_stableToken);
    }

    /**
     * @notice Swap RWA tokens to receive stablecoins (via LP off-chain bot)
     * @param rwaAmount The amount of RWA tokens to swap
     */
    function swap(uint256 rwaAmount) external {
        require(rwaAmount > 0, "Amount must be greater than 0");

        uint256 allowance = rwaToken.allowance(msg.sender, address(this));
        require(allowance >= rwaAmount, "Insufficient allowance");

        uint256 balance = rwaToken.balanceOf(msg.sender);
        require(balance >= rwaAmount, "Insufficient RWA token balance");

        bool success = rwaToken.transferFrom(msg.sender, address(this), rwaAmount);
        require(success, "RWA transferFrom failed");

        uint256 fee = (rwaAmount * feeBasisPoints) / 10000;
        uint256 amountAfterFee = rwaAmount - fee;

        emit SwapRequested(msg.sender, amountAfterFee, fee);
    }

    /**
     * @notice Withdraw stable tokens from the contract (admin only)
     * @param amount Amount of stable tokens to withdraw
     */
    function withdrawStable(uint256 amount) external {
        require(msg.sender == admin, "Not admin");
        require(stableToken.transfer(admin, amount), "Withdraw failed");
    }

    /**
     * @notice Update the fee charged on swaps (admin only)
     * @param newFeeBasisPoints New fee in basis points (max 500 = 5%)
     */
    function setFee(uint256 newFeeBasisPoints) external {
        require(msg.sender == admin, "Not admin");
        require(newFeeBasisPoints <= 500, "Fee too high"); // max 5%
        feeBasisPoints = newFeeBasisPoints;
    }

    /**
     * @dev Test-only helper to simulate transferFrom call from inside the contract
     */
    function testSwapFromUser(address user, uint256 amount) external {
        require(rwaToken.transferFrom(user, address(this), amount), "Transfer failed");
    }
}
