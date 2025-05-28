// scripts/check_connection.js
const { ethers } = require("hardhat");

async function main() {
  const network = await ethers.provider.getNetwork();
  console.log(`✅ Connected to network: ${network.name} (chainId: ${network.chainId})`);

  const blockNumber = await ethers.provider.getBlockNumber();
  console.log(`📦 Latest block number: ${blockNumber}`);
}

main().catch((error) => {
  console.error("❌ Error connecting to network:", error);
  process.exitCode = 1;
});
