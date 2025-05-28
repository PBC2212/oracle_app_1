require("dotenv").config();
const { ethers } = require("ethers");
const AST_ABI = require("./abi/AssetoracleToken.json").abi;

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.LP_PRIVATE_KEY, provider); // wallet with minting rights
const ast = new ethers.Contract(process.env.AST_ADDRESS, AST_ABI, wallet);

async function main() {
  const userAddress = process.env.USER_ADDRESS;
  const amountToMint = ethers.parseUnits("100", 18); // 100 AST

  console.log(`🪙 Minting ${ethers.formatUnits(amountToMint, 18)} AST to ${userAddress}...`);
  const tx = await ast.mintAssetToken(userAddress, amountToMint);
  await tx.wait();
  console.log("✅ Mint complete!");
}

main();
