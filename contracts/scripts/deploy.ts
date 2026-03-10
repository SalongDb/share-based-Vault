import { network } from "hardhat";

async function main() {
  const { viem } = await network.connect();

  console.log("Deploying contract...");

  const vault = await viem.deployContract("Vault");

  console.log("Vault address:", vault.address);
  console.log("Deployment successful!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});