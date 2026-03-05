// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Vault is ERC20, ReentrancyGuard {
    constructor() ERC20("Vault Share", "VSH") {}

    error ZeroDeposit();
    error ZeroSharesMinted();
    error ZeroWithdraw();
    error NoSharesExist();
    error InsufficientShares();
    error TxFailed();

    event Deposit(address indexed sender, uint256 amount);
    event Withdraw(address indexed receiver, uint256 amount);

    receive() external payable {}

    function deposit() external payable {
        if (msg.value == 0) revert ZeroDeposit();

        uint256 supply = totalSupply();
        uint256 assetBefore = address(this).balance - msg.value;
        uint256 sharesToMint;

        if (supply == 0) {
            sharesToMint = msg.value;
        } else {
            sharesToMint = (msg.value * supply) / assetBefore;
        }

        if (sharesToMint == 0) revert ZeroSharesMinted();

        _mint(msg.sender,sharesToMint);

        emit Deposit(msg.sender,msg.value);
    }

    function withdraw(uint256 sharesAmount) external nonReentrant {
        uint256 supply = totalSupply();
        
        if (sharesAmount == 0) revert ZeroWithdraw();
        if (supply == 0) revert NoSharesExist();
        if (balanceOf(msg.sender) < sharesAmount) revert InsufficientShares();

        uint256 totalAsset = totalAssets();
        uint256 assetsToReturn = (sharesAmount * totalAsset) / supply;

        _burn(msg.sender,sharesAmount);

        (bool success, ) = payable(msg.sender).call{value: assetsToReturn}("");
        if (!success) revert TxFailed();

        emit Withdraw(msg.sender,assetsToReturn);
    }

    function totalAssets() public view returns (uint256) {
        return address(this).balance;
    }
}
