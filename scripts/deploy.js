const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  // 1. Deploy AssetOracleToken
  const Token = await hre.ethers.getContractFactory("AssetOracleToken");
  const token = await Token.deploy("AssetToken", "AST");
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("✅ Deployed AssetOracleToken to:", tokenAddress);

  // 2. Deploy MockUSDT
  const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
  const usdt = await MockUSDT.deploy();
  await usdt.waitForDeployment();
  const usdtAddress = await usdt.getAddress();
  console.log("✅ Deployed MockUSDT to:", usdtAddress);

  // 3. Deploy VaultSwap (link AssetOracleToken + MockUSDT)
  const VaultSwap = await hre.ethers.getContractFactory("VaultSwap");
  const vaultSwap = await VaultSwap.deploy(tokenAddress, usdtAddress);
  await vaultSwap.waitForDeployment();
  const vaultSwapAddress = await vaultSwap.getAddress();
  console.log("✅ Deployed VaultSwap to:", vaultSwapAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
