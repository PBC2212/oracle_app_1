require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");

// Load ABI
const vaultSwapAbi = require("./abi/VaultSwap.json").abi;

// Environment Setup
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const userWallet = new ethers.Wallet(process.env.SEPOLIA_PRIVATE_KEY, provider);

const vaultSwapAddress = process.env.VAULT_SWAP_ADDRESS;
const vaultSwap = new ethers.Contract(vaultSwapAddress, vaultSwapAbi, userWallet);

// Example: Simulate a swap of 100 RWA tokens
async function main() {
  const rwaAmount = ethers.parseUnits("100", 18); // Adjust decimals if needed

  try {
    console.log(`🚀 Calling swap(${rwaAmount})...`);
    const tx = await vaultSwap.swap(rwaAmount);
    await tx.wait();
    console.log(`✅ Swap triggered: ${tx.hash}`);
  } catch (err) {
    console.error("❌ Swap failed:", err);
  }
}

main();
