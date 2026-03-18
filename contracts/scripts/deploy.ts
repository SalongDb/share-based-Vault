import { network } from "hardhat";
import fs from "fs";

async function main() {
  const { viem } = await network.connect();

  const [walletClient] = await viem.getWalletClients();

  console.log("Deploying from:", walletClient.account.address);

  const vault = await viem.deployContract("Vault", []);

  console.log("Vault deployed at:", vault.address);

  fs.writeFileSync(
    "deployments.json",
    JSON.stringify({ vault: vault.address }, null, 2)
  );
}

main().catch(console.error);