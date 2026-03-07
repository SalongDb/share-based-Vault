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
    error IncorrectETH();
    error TxFailed();

    event Deposit(address indexed sender, uint256 assets, uint256 shares);
    event Withdraw(address indexed receiver, uint256 assets, uint256 shares);

    receive() external payable {}
    uint256 public constant MINIMUM_LIQUIDITY = 1000;
    address public constant BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;

    // Main functions
    function deposit() external payable {
        if (msg.value == 0) revert ZeroDeposit();

        uint256 supply = totalSupply();
        uint256 sharesToMint;

        if (supply == 0) {
            if ( msg.value <= MINIMUM_LIQUIDITY ) revert ZeroSharesMinted();
            sharesToMint = msg.value - MINIMUM_LIQUIDITY;
            _mint(BURN_ADDRESS, MINIMUM_LIQUIDITY);
        } else {
            uint256 assetBefore = address(this).balance - msg.value;
            sharesToMint = (msg.value * supply) / assetBefore;
        }

        if (sharesToMint == 0) revert ZeroSharesMinted();

        _mint(msg.sender, sharesToMint);

        emit Deposit(msg.sender, msg.value, sharesToMint);
    }

    function mint(uint256 shares) external payable {
        if (shares == 0) revert ZeroDeposit();

        uint256 supply = totalSupply();
        if (supply == 0) revert NoSharesExist();

        uint256 assets = previewMint(shares);

        if (assets == 0) revert ZeroDeposit();
        if (msg.value < assets) revert IncorrectETH();

        _mint(msg.sender, shares);

        emit Deposit(msg.sender, assets, shares);
    }

    function withdraw(uint256 sharesAmount) external nonReentrant {
        uint256 supply = totalSupply();

        if (sharesAmount == 0) revert ZeroWithdraw();
        if (supply == 0) revert NoSharesExist();
        if (balanceOf(msg.sender) < sharesAmount) revert InsufficientShares();

        uint256 totalAsset = totalAssets();
        uint256 assetsToReturn = (sharesAmount * totalAsset) / supply;

        _burn(msg.sender, sharesAmount);

        (bool success, ) = payable(msg.sender).call{value: assetsToReturn}("");
        if (!success) revert TxFailed();

        emit Withdraw(msg.sender, assetsToReturn, sharesAmount);
    }

    function redeem(uint256 shares) external nonReentrant {
        if (shares == 0) revert ZeroWithdraw();

        uint256 supply = totalSupply();

        if (supply == 0) revert NoSharesExist();
        if (balanceOf(msg.sender) < shares) revert InsufficientShares();

        uint256 assets = convertToAssets(shares);

        _burn(msg.sender, shares);

        (bool success, ) = payable(msg.sender).call{value: assets}("");
        if (!success) revert TxFailed();

        emit Withdraw(msg.sender, assets, shares);
    }

    // Vault Accounting
    function totalAssets() public view returns (uint256) {
        return address(this).balance;
    }

    function convertToShares(uint256 assets) public view returns (uint256) {
        uint256 supply = totalSupply();
        uint256 assetsInVault = totalAssets();

        if (supply == 0) {
            if (assets <= MINIMUM_LIQUIDITY) return 0;
            return assets - MINIMUM_LIQUIDITY;
        }

        return (assets * supply) / assetsInVault;
    }

    function convertToAssets(uint256 shares) public view returns (uint256) {
        uint256 supply = totalSupply();

        if (supply == 0) {
            return shares;
        }

        return (shares * totalAssets()) / supply;
    }

    // Preview Functions
    function previewDeposit(uint256 assets) public view returns (uint256) {
        uint256 supply = totalSupply();

        if(supply == 0) {
            if (assets <= MINIMUM_LIQUIDITY) return 0;
            return assets - MINIMUM_LIQUIDITY;
        }
        return convertToShares(assets);
    }

    function previewMint(uint256 shares) public view returns (uint256) {
        return convertToAssets(shares);
    }

    function previewWithdraw(uint256 assets) public view returns (uint256) {
        return convertToShares(assets);
    }

    function previewRedeem(uint256 shares) public view returns (uint256) {
        return convertToAssets(shares);
    }

    // Limit functions
    function maxDeposit(address) public pure returns (uint256){
        return type(uint256).max;
    }
    function maxMint(address) public pure returns (uint256){
        return type(uint256).max;
    }
    function maxWithdraw(address owner) public view returns (uint256){
        return convertToAssets(balanceOf(owner));
    }
    function maxRedeem(address owner) public view returns (uint256){
        return balanceOf(owner);
    }
}
