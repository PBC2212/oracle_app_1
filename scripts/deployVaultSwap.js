const hre = require("hardhat");

async function main() {
  const rwaTokenAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
  const stableTokenAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

  const VaultSwap = await hre.ethers.getContractFactory("VaultSwap");
  const vaultSwap = await VaultSwap.deploy(rwaTokenAddress, stableTokenAddress);
  await vaultSwap.waitForDeployment();

  console.log("✅ VaultSwap deployed to:", await vaultSwap.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
