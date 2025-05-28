require("dotenv").config();
const { ethers } = require("ethers");
const vaultSwapAbi = require("../abi/VaultSwap.json");

// Setup
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const iface = new ethers.Interface(vaultSwapAbi.abi);
const vaultSwapAddress = process.env.VAULT_SWAP_ADDRESS;

let lastBlock = 0;

async function pollEvents() {
  try {
    const latestBlock = await provider.getBlockNumber();
    const fromBlock = lastBlock || latestBlock - 5;

    console.log(`📦 Scanning blocks ${fromBlock} → ${latestBlock}...`);

    const logs = await provider.getLogs({
      address: vaultSwapAddress,
      fromBlock,
      toBlock: latestBlock,
      topics: [ethers.id("SwapRequested(address,uint256,uint256)")]
    });

    for (const log of logs) {
      const parsed = iface.parseLog(log);
      console.log(`🔔 SwapRequested Event Detected:
→ User: ${parsed.args.user}
→ Amount: ${ethers.formatUnits(parsed.args.amount, 18)} USDT
→ Fee: ${ethers.formatUnits(parsed.args.fee, 18)} AST`);
    }

    lastBlock = latestBlock + 1;
  } catch (err) {
    console.error("❌ Error polling events:", err);
  }
}

// Poll every 10 seconds
setInterval(pollEvents, 10000);
