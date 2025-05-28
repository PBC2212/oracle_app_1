require("dotenv").config();
const { ethers } = require("ethers");
const vaultSwapAbi = require("./abi/VaultSwap.json").abi;
const rwaAbi = require("./abi/AssetOracleToken.json").abi;

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const signer = new ethers.Wallet(process.env.USER_PRIVATE_KEY, provider);

const VAULT_SWAP_ADDRESS = process.env.VAULT_SWAP_ADDRESS;
const ASSET_ORACLE_TOKEN_ADDRESS = process.env.ASSET_ORACLE_TOKEN_ADDRESS;
const rwaAmount = ethers.parseEther("100"); // 100 tokens

async function main() {
  const user = await signer.getAddress();
  const rwaToken = new ethers.Contract(ASSET_ORACLE_TOKEN_ADDRESS, rwaAbi, signer);
  const vaultSwap = new ethers.Contract(VAULT_SWAP_ADDRESS, vaultSwapAbi, signer);

  // Log RWA token balance
  const balance = await rwaToken.balanceOf(user);
  console.log(`📦 RWA Balance for ${user}: ${ethers.formatEther(balance)} tokens`);

  if (balance < rwaAmount) {
    console.error("❌ Insufficient RWA balance");
    return;
  }

  // Approve VaultSwap to spend RWA tokens
  console.log("🔓 Approving VaultSwap to spend RWA...");
  const approveTx = await rwaToken.approve(VAULT_SWAP_ADDRESS, rwaAmount);
  await approveTx.wait();
  console.log("✅ Approved!");

  // Call swap
  console.log(`📨 Sending swap transaction for ${rwaAmount} wei...`);
  try {
    const tx = await vaultSwap.swap(rwaAmount);
    await tx.wait();
    console.log("✅ Swap completed!");
  } catch (err) {
    console.error("❌ Error in swap request:", err);
  }
}

main();
