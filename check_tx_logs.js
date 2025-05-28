require("dotenv").config();
const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const vaultSwapAbi = require("./abi/VaultSwap.json").abi;

async function main() {
  const txHash = "0xdeeeea8f2e1d68d6b9a4e86335d5655fd306198257fa77c3a81d4990f8200fc5"; // paste your swap tx here
  const txReceipt = await provider.getTransactionReceipt(txHash);
  const iface = new ethers.Interface(vaultSwapAbi);

  console.log("🔍 Logs:");
  for (const log of txReceipt.logs) {
    try {
      const parsed = iface.parseLog(log);
      console.log(`✅ Event: ${parsed.name}`);
      console.log(parsed.args);
    } catch {
      // skip unrelated logs
    }
  }
}

main();
