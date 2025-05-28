require("dotenv").config();
const { ethers } = require("ethers");
const vaultSwapAbi = require("./abi/VaultSwap.json").abi;

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const userWallet = new ethers.Wallet(process.env.SEPOLIA_PRIVATE_KEY, provider);

const vaultSwap = new ethers.Contract(
  process.env.VAULT_SWAP_ADDRESS,
  vaultSwapAbi,
  userWallet
);

async function main() {
  const rwaAmount = ethers.parseUnits("100", 18); // Swap 100 RWA tokens
  console.log(`🚀 Calling swap(${rwaAmount})...`);
  try {
    const tx = await vaultSwap.swap(rwaAmount);
    await tx.wait();
    console.log(`✅ Swap triggered: ${tx.hash}`);
  } catch (err) {
    console.error("❌ Swap failed:", err);
  }
}

main();
