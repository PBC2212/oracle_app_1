require("dotenv").config();
const { ethers } = require("ethers");
const vaultAbi = require("./abi/VaultSwap.json");
const usdtAbi = require("./abi/USDT.json");
const fs = require("fs");

// === ENV & PROVIDER SETUP ===
console.log("🔧 Loading environment...");
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const lpWallet = new ethers.Wallet(process.env.LP_PRIVATE_KEY, provider);

const vaultAddress = process.env.VAULT_SWAP_ADDRESS;
const usdtAddress = process.env.STABLE_TOKEN_ADDRESS;
console.log("🔗 Vault Contract:", vaultAddress);
console.log("💵 Stable Token:", usdtAddress);

// === CONTRACTS ===
const vaultContract = new ethers.Contract(vaultAddress, vaultAbi, provider);
const usdt = new ethers.Contract(usdtAddress, usdtAbi, lpWallet);

// === EVENT LISTENER ===
console.log("🟢 Listening for SwapRequested events...");
vaultContract.on("SwapRequested", async (user, amount, fee) => {
  console.log(`🔔 SwapRequested by ${user}: ${amount} USDT (fee: ${fee})`);

  try {
    const decimals = await usdt.decimals();
    const parsedAmount = ethers.parseUnits(amount.toString(), decimals);

    const tx = await usdt.transfer(user, parsedAmount);
    await tx.wait();

    console.log(`✅ Sent ${amount} USDT to ${user}`);
    fs.appendFileSync("listener_notes.txt", `✅ Sent ${amount} USDT to ${user}\n`);
  } catch (err) {
    console.error("❌ Error sending asset:", err);
    fs.appendFileSync("listener_notes.txt", `❌ ERROR for ${user}: ${err}\n`);
  }
});
