require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// Load ABI
const abiPath = path.join(__dirname, "abi", "AssetOracleToken.json");
const abiJson = JSON.parse(fs.readFileSync(abiPath, "utf8"));
const abi = abiJson.abi || abiJson;

// Setup provider and signer
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Load addresses
const tokenAddress = process.env.AST_ADDRESS;
const recipient = process.env.RECIPIENT_ADDRESS;
const amount = ethers.parseUnits("100", 18); // Mint 100 tokens

// Validate .env variables
if (!tokenAddress) {
  console.error("❌ AST_ADDRESS is not set in .env");
  process.exit(1);
}
if (!recipient) {
  console.error("❌ RECIPIENT_ADDRESS is not set in .env");
  process.exit(1);
}
if (!process.env.PRIVATE_KEY) {
  console.error("❌ PRIVATE_KEY is not set in .env");
  process.exit(1);
}

console.log("📦 Using contract:", tokenAddress);
console.log("🎯 Minting to:", recipient);
console.log("🔢 Amount:", amount.toString());

async function main() {
  try {
    const token = new ethers.Contract(tokenAddress, abi, signer);
    const tx = await token.mintAssetToken(recipient, amount);
    console.log("🚀 Mint tx sent. Hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Mint successful. Confirmed in block:", receipt.blockNumber);
  } catch (err) {
    console.error("❌ Mint failed:", err);
  }
}

main();
