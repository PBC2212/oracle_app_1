require("dotenv").config();
const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const contractAddress = process.env.CONTRACT_ADDRESS || "PUT_YOUR_DEPLOYED_TOKEN_ADDRESS_HERE";

  const Token = await hre.ethers.getContractFactory("AssetOracleToken");
  const token = await Token.attach(contractAddress);

  console.log(`🚀 Minting to ${signer.address}...`);
  const tx = await token.mintAssetToken(signer.address, hre.ethers.parseUnits("1000", 18));
  await tx.wait();
  console.log("✅ Mint complete.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
