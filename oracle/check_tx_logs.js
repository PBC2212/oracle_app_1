require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");

// Load ABI
const abi = JSON.parse(fs.readFileSync("abi/VaultSwap.json", "utf8"));

// Setup provider and contract
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const vault = new ethers.Contract(process.env.VAULT_SWAP_ADDRESS, abi, provider);

async function main() {
  console.log("🔎 Fetching recent logs for SwapRequested event...");

  const latestBlock = await provider.getBlockNumber();
  const fromBlock = latestBlock - 500; // Search last 500 blocks

  const logs = await vault.queryFilter("SwapRequested", fromBlock, latestBlock);

  if (logs.length === 0) {
    console.log("❌ No SwapRequested events found.");
    return;
  }

  for (const event of logs) {
    const { user, amount, timestamp } = event.args;
    console.log("🔔 Event:");
    console.log("👤 User:", user);
    console.log("💰 Amount:", ethers.formatUnits(amount, 18));
    console.log("⏰ Timestamp:", new Date(timestamp * 1000).toLocaleString());
    console.log("🔗 Tx:", event.transactionHash);
  }
}

main();
