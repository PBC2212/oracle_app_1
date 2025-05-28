// scripts/test_swap.js

require("dotenv").config();
const ethers = require("ethers"); // <--- FIXED
const fs = require("fs");

// Load VaultSwap ABI
const abi = JSON.parse(fs.readFileSync("abi/VaultSwap.json", "utf8")).abi;

// Setup provider and wallet
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL); // <--- FIXED
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Contract instance
const vaultSwap = new ethers.Contract(process.env.VAULT_SWAP_ADDRESS, abi, wallet);

// Define amount to swap (e.g., 1000 RWA tokens)
const amount = ethers.parseUnits("1000", 18); // <--- FIXED for ethers v6

async function main() {
  console.log(`🚀 Calling requestSwap(${amount.toString()}) from ${wallet.address}`);
  const tx = await vaultSwap.requestSwap(amount);
  console.log("📤 Transaction sent:", tx.hash);
  await tx.wait();
  console.log("✅ Swap requested successfully.");
}

main().catch((err) => {
  console.error("❌ Error:", err);
});
