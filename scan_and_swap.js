require("dotenv").config();
const fs = require("fs");
const ethers = require("ethers"); // Correct for Ethers v6+

// Load ABI
const abi = JSON.parse(fs.readFileSync("abi/VaultSwap.json", "utf-8")).abi;
const erc20Abi = [
  "function transfer(address to, uint amount) public returns (bool)"
];

// Setup provider and wallet
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.LP_PRIVATE_KEY, provider);

// Load contracts
const vaultSwap = new ethers.Contract(process.env.VAULT_SWAP_ADDRESS, abi, provider);
const stableToken = new ethers.Contract(process.env.STABLE_TOKEN_ADDRESS, erc20Abi, wallet);

// Scan latest block for events
async function main() {
  const latestBlock = await provider.getBlockNumber();
  console.log(`📦 Scanning block ${latestBlock}...`);

  const events = await vaultSwap.queryFilter("SwapRequested", latestBlock, latestBlock);

  for (const event of events) {
    const { user, amount, fee } = event.args;
    const netAmount = amount - fee;

    console.log("📡 SwapRequested:");
    console.log("👤 User:", user);
    console.log("💰 Amount:", amount.toString());
    console.log("💸 Fee:", fee.toString());
    console.log("➡️  Sending:", netAmount.toString(), "to", user);

    try {
      const tx = await stableToken.transfer(user, netAmount.toString());
      console.log("✅ Sent! TxHash:", tx.hash);
    } catch (err) {
      console.error("❌ Transfer failed:", err.message);
    }
  }

  if (events.length === 0) {
    console.log("🔍 No SwapRequested events found.");
  }
}

main();
