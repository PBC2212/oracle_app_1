require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");

// ✅ Correctly extract ABI from Hardhat artifacts
const vaultAbi = require("./abi/VaultSwap.json").abi;
const astAbi = require("./abi/AssetOracleToken.json").abi;

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const userWallet = new ethers.Wallet(process.env.USER_PRIVATE_KEY, provider);

const vaultAddress = process.env.VAULT_SWAP_ADDRESS;
const astAddress = process.env.AST_ADDRESS;

const vault = new ethers.Contract(vaultAddress, vaultAbi, userWallet);
const ast = new ethers.Contract(astAddress, astAbi, userWallet);

async function main() {
  const decimals = await ast.decimals();
  const amount = ethers.parseUnits("100", decimals); // 100 AST

  console.log(`🔑 Approving ${amount} AST to VaultSwap...`);
  const approveTx = await ast.approve(vaultAddress, amount);
  await approveTx.wait();
  console.log("✅ Approved");

  console.log(`💱 Requesting swap of ${amount} AST...`);
  const swapTx = await vault.swap(amount);
  await swapTx.wait();
  console.log("✅ Swap requested");
}

main().catch((err) => {
  const message = err.message || err.toString();
  console.error("❌ Error:", message);
  fs.appendFileSync("listener_notes.txt", `❌ test_swap error: ${message}\n`);
});
