require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");

// Load ABI
const abi = JSON.parse(fs.readFileSync("abi/VaultSwap.json")).abi;
const erc20Abi = [
  "function transfer(address to, uint amount) public returns (bool)"
];

// Setup provider and wallet
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.LP_PRIVATE_KEY, provider);

// Load contract
const vaultSwap = new ethers.Contract(process.env.VAULT_SWAP_ADDRESS, abi, provider);
const stableToken = new ethers.Contract(process.env.STABLE_TOKEN_ADDRESS, erc20Abi, wallet);

// Track latest scanned block
let lastBlock = 0;

async function scanAndSwap() {
  try {
    const currentBlock = await provider.getBlockNumber();

    if (lastBlock === 0) lastBlock = currentBlock - 1;
    if (currentBlock === lastBlock) return; // skip if no new blocks

    console.log(`📦 Scanning blocks ${lastBlock + 1} to ${currentBlock}...`);

    const events = await vaultSwap.queryFilter("SwapRequested", lastBlock + 1, currentBlock);

    for (const event of events) {
      const { user, amount, fee } = event.args;
      const netAmount = amount.sub(fee);

      console.log("📡 SwapRequested:");
      console.log("👤 User:", user);
      console.log("💰 Amount:", amount.toString());
      console.log("💸 Fee:", fee.toString());
      console.log("➡️  Sending:", netAmount.toString(), "to", user);

      try {
        const tx = await stableToken.transfer(user, netAmount);
        console.log("✅ Sent! TxHash:", tx.hash);
      } catch (err) {
        console.error("❌ Transfer failed:", err.message);
      }
    }

    if (events.length === 0) {
      console.log("🔍 No SwapRequested events found.");
    }

    lastBlock = currentBlock;
  } catch (err) {
    console.error("❌ Scan error:", err.message);
  }
}

// Loop every 5 seconds
setInterval(scanAndSwap, 5000);
