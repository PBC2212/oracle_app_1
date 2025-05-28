// scripts/approve_ast.js

require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const AST_ADDRESS = process.env.AST_ADDRESS;
const VAULT_SWAP_ADDRESS = process.env.VAULT_SWAP_ADDRESS;
const PRIVATE_KEY = process.env.USER_PRIVATE_KEY;
const RPC_URL = process.env.SEPOLIA_RPC_URL;

if (!AST_ADDRESS || !VAULT_SWAP_ADDRESS) {
  throw new Error("❌ Missing token or vault address in .env");
}

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  const abiPath = path.join(__dirname, "../abi/AssetOracleToken.json");
  const abi = JSON.parse(fs.readFileSync(abiPath)).abi;

  const ast = new ethers.Contract(AST_ADDRESS, abi, wallet);

  const amount = ethers.parseUnits("1000000", 18); // Approve 1 million tokens
  const tx = await ast.approve(VAULT_SWAP_ADDRESS, amount);
  console.log(`⏳ Approving... TX: ${tx.hash}`);
  await tx.wait();
  console.log("✅ Approved AST for VaultSwap");
}

main().catch((err) => {
  console.error("Error:", err);
});
