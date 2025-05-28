// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AssetOracleToken is ERC20, Ownable {
    address public oracle;

    constructor(string memory name, string memory symbol)
        ERC20(name, symbol)
        Ownable(msg.sender)
    {
        oracle = msg.sender;
    }

    modifier onlyOracle() {
        require(msg.sender == oracle, "Not authorized");
        _;
    }

    function setOracle(address newOracle) external onlyOwner {
        oracle = newOracle;
    }

    function mintAssetToken(address to, uint256 amount) external onlyOracle {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyOracle {
        _burn(from, amount);
    }
}
