// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Vault is ReentrancyGuard {
    mapping(address => uint) public shares;
    uint256 public totalShares;

    error ZeroDeposit();
    error ZeroSharesMinted();
    error ZeroWithdraw();
    error NoSharesExist();
    error InsufficientShares();
    error TxFailed();

    event Deposit(address indexed sender, uint256 amount);
    event Withdraw(address indexed receiver, uint256 amount);

    function deposit() external payable {
        if (msg.value == 0) revert ZeroDeposit();

        uint256 assetBefore = address(this).balance - msg.value;
        uint256 sharesToMint;

        if (totalShares == 0) {
            sharesToMint = msg.value;
        } else {
            sharesToMint = (msg.value * totalShares) / assetBefore;
        }

        if (sharesToMint == 0) revert ZeroSharesMinted();

        shares[msg.sender] += sharesToMint;
        totalShares += sharesToMint;

        emit Deposit(msg.sender,msg.value);
    }

    function withdraw(uint256 sharesAmount) external nonReentrant {
        if (sharesAmount == 0) revert ZeroWithdraw();
        if (totalShares == 0) revert NoSharesExist();
        if (shares[msg.sender] < sharesAmount) revert InsufficientShares();

        uint256 totalAssets = address(this).balance;
        uint256 assetsToReturn = (sharesAmount * totalAssets) / totalShares;

        shares[msg.sender] -= sharesAmount;
        totalShares -= sharesAmount;

        (bool success, ) = payable(msg.sender).call{value: assetsToReturn}("");
        if (!success) revert TxFailed();

        emit Withdraw(msg.sender,assetsToReturn);
    }

    function totalAsset() public view returns (uint256) {
        return address(this).balance;
    }
}
