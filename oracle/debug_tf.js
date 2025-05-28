require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");

const AST_ABI = JSON.parse(fs.readFileSync("./abi/AssetOracleToken.json", "utf8")).abi;

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const userWallet = new ethers.Wallet(process.env.USER_PRIVATE_KEY, provider);
const ast = new ethers.Contract(process.env.AST_ADDRESS, AST_ABI, userWallet);

const vaultSwapAddress = process.env.VAULT_SWAP_ADDRESS;
const decimals = 18;
const amount = ethers.parseUnits("100", decimals);

async function runTest() {
  try {
    console.log(`🔑 Re-approving ${amount} AST for VaultSwap...`);
    const approveTx = await ast.approve(vaultSwapAddress, amount);
    await approveTx.wait();
    console.log("✅ Re-approved AST");

    console.log(`🔍 Testing transferFrom USER → VaultSwap for ${amount} AST...`);
    const transferTx = await ast.transferFrom(userWallet.address, vaultSwapAddress, amount);
    await transferTx.wait();
    console.log("✅ transferFrom success");

  } catch (err) {
    console.error("❌ transferFrom failed:", err);
  }
}

runTest();
