require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// Load ABI
const abiPath = path.join(__dirname, "abi", "AssetOracleToken.json");
const abi = JSON.parse(fs.readFileSync(abiPath, "utf8")).abi;

// Setup
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Contract address
const tokenAddress = process.env.AST_ADDRESS;
const recipient = process.env.RECIPIENT_ADDRESS;
const amount = ethers.parseUnits("100", 18); // Burn 100 tokens (18 decimals)

async function main() {
  try {
    const token = new ethers.Contract(tokenAddress, abi, signer);
    console.log("📦 Using contract:", tokenAddress);
    console.log("🔥 Burning from:", recipient);
    console.log("🔢 Amount:", amount.toString());

    const tx = await token.burn(recipient, amount);
    console.log("🚀 Burn tx sent. Hash:", tx.hash);

    const receipt = await tx.wait();
    console.log("✅ Burn successful. Confirmed in block:", receipt.blockNumber);
  } catch (err) {
    console.error("❌ Burn failed:", err);
  }
}

main();
