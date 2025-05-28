require("dotenv").config();
const { ethers } = require("ethers");
const vaultSwapAbi = require("./abi/VaultSwap.json").abi;

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const userWallet = new ethers.Wallet(process.env.USER_PRIVATE_KEY, provider); // user triggers swap

const vaultSwap = new ethers.Contract(process.env.VAULT_SWAP_ADDRESS, vaultSwapAbi, userWallet);

async function main() {
  const rwaAmount = ethers.parseUnits("100", 18); // swap 100 RWA tokens
  const tx = await vaultSwap.swap(rwaAmount);
  console.log("📝 Sent swap tx:", tx.hash);
  await tx.wait();
  console.log("✅ Swap complete");
}

main();
