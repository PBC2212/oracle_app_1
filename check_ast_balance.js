require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// Load ABI
const abiPath = path.join(__dirname, "abi", "AssetOracleToken.json");
const abi = JSON.parse(fs.readFileSync(abiPath, "utf8")).abi;

// Setup provider and contract
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const token = new ethers.Contract(process.env.AST_ADDRESS, abi, provider);

// Address to check
const wallet = process.env.RECIPIENT_ADDRESS;

async function main() {
  try {
    const balance = await token.balanceOf(wallet);
    const formatted = ethers.formatUnits(balance, 18);
    console.log(`🔍 AST Balance of ${wallet}: ${formatted} tokens`);
  } catch (err) {
    console.error("❌ Error checking balance:", err);
  }
}

main();
