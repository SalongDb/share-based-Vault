# 🎨 Vault Frontend

A React-based frontend for interacting with the ETH Vault smart contract.

---

## 🚀 Features

- Connect wallet (Wagmi)
- Deposit ETH or mint shares
- Withdraw ETH or redeem shares
- Live previews for transactions
- Real-time vault stats
- Owner dashboard (fee withdrawal)
- Loading & error handling for better UX

---

## 🧠 Architecture

### Hooks

- `useVault` → user actions + previews
- `useVaultStats` → global vault data
- `useOwner` → admin functionality

---

## 🖥️ UI Features

- Share price display
- Buy / Sell panels
- Account overview
- Owner dashboard
- Disabled buttons + loading states

---

## 🛠️ Tech Stack

- React + TypeScript
- Wagmi + Viem
- TailwindCSS
- Vite

---

## ⚙️ Setup


npm install  
npm run dev


---

## 🔗 Contract Integration

Configured via:

contracts/vault.ts


Make sure contract address and ABI are correct.

---

## 🌐 Deployment

Recommended: **Vercel**


npm run build


---

## ⚠️ Notes

- Uses `parseEther` and `formatEther` for precision
- Handles invalid inputs safely
- Prevents unnecessary RPC calls using `enabled`

---

## 📄 License
MIT