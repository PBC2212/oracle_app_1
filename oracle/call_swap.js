require("dotenv").config();
const { ethers } = require("ethers");
const vaultAbi = require("./abi/VaultSwap.json");

// === SELECT NETWORK ===
const isSepolia = process.argv.includes("--sepolia");
const provider = new ethers.JsonRpcProvider(
  isSepolia ? process.env.SEPOLIA_RPC_URL : process.env.RPC_URL
);

const signer = new ethers.Wallet(
  isSepolia ? process.env.SEPOLIA_PRIVATE_KEY : process.env.PRIVATE_KEY,
  provider
);

const contractAddress = process.env.CONTRACT_ADDRESS;
const vaultContract = new ethers.Contract(contractAddress, vaultAbi, signer);

async function main() {
  const amount = ethers.parseUnits("1", 18); // 1 token
  const tx = await vaultContract.swap(amount);
  console.log("📤 Swap TX sent:", tx.hash);
  await tx.wait();
  console.log("✅ Swap confirmed!");
}

main().catch((err) => {
  console.error("❌ Swap failed:", err);
});
