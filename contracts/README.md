# 🔐 Vault Smart Contract

A minimal ETH vault contract that allows users to deposit ETH, receive shares, and withdraw assets with a fee.

---

## 🚀 Features

- Deposit ETH → receive ERC20 shares
- Withdraw ETH by burning shares
- 1% withdrawal fee
- Owner can collect accumulated fees
- Preview functions for frontend integration
- Reentrancy protection
- Pausable contract

---

## 📜 Contract Overview

### Core Functions

#### Deposit

deposit() payable

- Accepts ETH
- Mints shares based on vault ratio

---

#### Withdraw

withdraw(uint256 shares)

- Burns shares
- Returns ETH minus 1% fee

---

#### Owner Fee Withdrawal

withdrawFees(uint256 amount)

- Owner can withdraw collected fees

---

## 📊 Key Variables

- `totalAssets()` → ETH in vault (excluding fees)
- `totalSupply()` → total shares
- `feeBalance` → accumulated fees

---

## 🧠 Share Price


sharePrice = totalAssets / totalSupply


---

## ⚠️ Important Notes

- Initial deposit locks `MINIMUM_LIQUIDITY`
- Integer division causes slight rounding (expected behavior)
- Share price may increase slightly due to rounding + fees

---

## 🛠️ Tech

- Solidity ^0.8.x
- OpenZeppelin (ERC20, Ownable, ReentrancyGuard, Pausable)

---

## 🚀 Deployment

Deployed on **Sepolia Testnet**

Contract Address:

0x66BC1259b302f1FC46990bfBB665609f41A66e3b


---

## 📄 License
MIT