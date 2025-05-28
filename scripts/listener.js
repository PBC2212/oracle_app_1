require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");

// Load ABI
const vaultSwapAbi = require("../abi/VaultSwap.json");
const usdtAbi = require("../abi/MockUSDT.json");

// Config
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const lpWallet = new ethers.Wallet(process.env.LP_PRIVATE_KEY, provider);

const vaultSwap = new ethers.Contract(
  process.env.VAULT_SWAP_ADDRESS,
  vaultSwapAbi.abi,
  provider
);

const usdt = new ethers.Contract(
  process.env.STABLE_TOKEN_ADDRESS,
  usdtAbi.abi,
  lpWallet
);

// Listen for SwapRequested events
console.log("👂 Listening for SwapRequested events...");
vaultSwap.on("SwapRequested", async (user, amount, fee, event) => {
  console.log(`🔔 SwapRequested detected:
  → User: ${user}
  → Amount: ${ethers.formatUnits(amount, 18)} USDT
  → Fee: ${ethers.formatUnits(fee, 18)} AST`);

  try {
    const tx = await usdt.transfer(user, amount);
    await tx.wait();
    console.log(`✅ Sent ${ethers.formatUnits(amount, 18)} USDT to ${user}`);
  } catch (error) {
    console.error("❌ Transfer failed:", error);
  }
});
