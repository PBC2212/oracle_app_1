require("dotenv").config();
const { ethers } = require("ethers");
const vaultAbi = require("./abi/VaultSwap.json");

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.SEPOLIA_PRIVATE_KEY, provider);

const vaultAddress = process.env.VAULT_SWAP_ADDRESS;
const vaultContract = new ethers.Contract(vaultAddress, vaultAbi, wallet);

async function main() {
  const amount = ethers.parseUnits("10", 6); // Swap 10 tokens (USDT with 6 decimals)

  const tx = await vaultContract.swap(amount); // ✅ Use correct method
  console.log("Swap tx sent:", tx.hash);

  await tx.wait();
  console.log("✅ Swap confirmed");
}

main().catch(console.error);
