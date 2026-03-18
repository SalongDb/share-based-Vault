// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// OpenZeppelin contracts
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

// Simple ETH vault where users deposit ETH and get shares
contract Vault is ERC20, ReentrancyGuard, Pausable, Ownable {
    constructor() ERC20("Vault Share", "VSH") Ownable(msg.sender) {}

    // Custom errors
    error ZeroDeposit();
    error ZeroSharesMinted();
    error ZeroWithdraw();
    error NoSharesExist();
    error InsufficientShares();
    error InsufficientBalance();
    error IncorrectETH();
    error TxFailed();

    // Events
    event Deposit(address indexed sender, uint256 assets, uint256 shares);
    event Withdraw(address indexed receiver, uint256 assets, uint256 shares);
    event Fees(address indexed receiver, uint256 amount);

    // Allow contract to receive ETH
    receive() external payable {}

    uint256 public feeBalance; // collected fees

    uint256 public constant MINIMUM_LIQUIDITY = 1000; // locked forever
    address public constant BURN_ADDRESS =
        0x000000000000000000000000000000000000dEaD;

    // Deposit ETH and get shares
    function deposit() external payable whenNotPaused {
        if (msg.value == 0) revert ZeroDeposit();

        uint256 supply = totalSupply();
        uint256 sharesToMint;

        if (supply == 0) {
            // First deposit locks some liquidity
            if (msg.value <= MINIMUM_LIQUIDITY) revert ZeroSharesMinted();
            sharesToMint = msg.value - MINIMUM_LIQUIDITY;

            _mint(BURN_ADDRESS, MINIMUM_LIQUIDITY);
        } else {
            // Normal deposit
            uint256 assetBefore = address(this).balance - msg.value;
            if (assetBefore == 0) revert ZeroSharesMinted();

            sharesToMint = (msg.value * supply) / assetBefore;
        }

        if (sharesToMint == 0) revert ZeroSharesMinted();

        _mint(msg.sender, sharesToMint);

        emit Deposit(msg.sender, msg.value, sharesToMint);
    }

    // Mint exact shares by sending enough ETH
    function mint(uint256 shares) external payable whenNotPaused {
        if (shares == 0) revert ZeroDeposit();

        uint256 supply = totalSupply();
        if (supply == 0) revert NoSharesExist();

        uint256 assets = previewMint(shares);

        if (assets == 0) revert ZeroDeposit();
        if (msg.value < assets) revert IncorrectETH();

        _mint(msg.sender, shares);

        emit Deposit(msg.sender, assets, shares);

        // refund extra ETH
        if (msg.value > assets) {
            (bool refundSuccess, ) = payable(msg.sender).call{
                value: msg.value - assets
            }("");
            if (!refundSuccess) revert TxFailed();
        }
    }

    // Withdraw ETH by burning shares
    function withdraw(uint256 sharesAmount)
        external
        nonReentrant
        whenNotPaused
    {
        uint256 supply = totalSupply();

        if (sharesAmount == 0) revert ZeroWithdraw();
        if (supply == 0) revert NoSharesExist();
        if (balanceOf(msg.sender) < sharesAmount) revert InsufficientShares();

        uint256 totalAsset = totalAssets();
        uint256 assetsToReturn = (sharesAmount * totalAsset) / supply;

        // 1% fee
        uint256 withdrawFee = (assetsToReturn * 1) / 100;
        uint256 mainAmount = assetsToReturn - withdrawFee;

        _burn(msg.sender, sharesAmount);
        feeBalance += withdrawFee;

        (bool success, ) = payable(msg.sender).call{value: mainAmount}("");
        if (!success) revert TxFailed();

        emit Withdraw(msg.sender, mainAmount, sharesAmount);
    }

    // Same as withdraw but takes shares directly
    function redeem(uint256 shares)
        external
        nonReentrant
        whenNotPaused
    {
        if (shares == 0) revert ZeroWithdraw();

        uint256 supply = totalSupply();

        if (supply == 0) revert NoSharesExist();
        if (balanceOf(msg.sender) < shares) revert InsufficientShares();

        uint256 assets = convertToAssets(shares);

        uint256 withdrawFee = (assets * 1) / 100;
        uint256 mainAmount = assets - withdrawFee;

        _burn(msg.sender, shares);
        feeBalance += withdrawFee;

        (bool success, ) = payable(msg.sender).call{value: mainAmount}("");
        if (!success) revert TxFailed();

        emit Withdraw(msg.sender, mainAmount, shares);
    }

    // Owner withdraws collected fees
    function withdrawFees(uint256 amount)
        public
        onlyOwner
        nonReentrant
    {
        if (amount > feeBalance) revert InsufficientBalance();

        feeBalance -= amount;

        (bool success, ) = payable(owner()).call{value: amount}("");
        if (!success) revert TxFailed();

        emit Fees(owner(), amount);
    }

    // Total ETH in vault (excluding fees)
    function totalAssets() public view returns (uint256) {
        return address(this).balance - feeBalance;
    }

    // Convert ETH → shares
    function convertToShares(uint256 assets) public view returns (uint256) {
        uint256 supply = totalSupply();
        uint256 assetsInVault = totalAssets();

        if (supply == 0) {
            if (assets <= MINIMUM_LIQUIDITY) return 0;
            return assets - MINIMUM_LIQUIDITY;
        }

        return (assets * supply) / assetsInVault;
    }

    // Convert shares → ETH
    function convertToAssets(uint256 shares) public view returns (uint256) {
        uint256 supply = totalSupply();

        if (supply == 0) {
            return shares;
        }

        return (shares * totalAssets()) / supply;
    }

    // Preview functions (used by frontend)
    function previewDeposit(uint256 assets) public view returns (uint256) {
        uint256 supply = totalSupply();

        if (supply == 0) {
            if (assets <= MINIMUM_LIQUIDITY) return 0;
            return assets - MINIMUM_LIQUIDITY;
        }
        return convertToShares(assets);
    }

    function previewMint(uint256 shares) public view returns (uint256) {
        uint256 supply = totalSupply();
        uint256 assetsInVault = totalAssets();

        if (supply == 0) revert NoSharesExist();

        return (shares * assetsInVault) / supply;
    }

    function previewWithdraw(uint256 assets) public view returns (uint256) {
        return convertToShares(assets);
    }

    function previewRedeem(uint256 shares) public view returns (uint256) {
        return convertToAssets(shares);
    }

    // Limits
    function maxDeposit(address) public pure returns (uint256) {
        return type(uint256).max;
    }

    function maxMint(address) public pure returns (uint256) {
        return type(uint256).max;
    }

    function maxWithdraw(address owner) public view returns (uint256) {
        return convertToAssets(balanceOf(owner));
    }

    function maxRedeem(address owner) public view returns (uint256) {
        return balanceOf(owner);
    }

    // Pause / unpause
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }
}