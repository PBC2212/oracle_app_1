const hre = require("hardhat");

async function main() {
  const Token = await hre.ethers.getContractFactory("AssetOracleToken");
  const token = await Token.deploy("AssetToken", "AST");

  await token.waitForDeployment();
  console.log("✅ AssetOracleToken deployed to:", await token.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
