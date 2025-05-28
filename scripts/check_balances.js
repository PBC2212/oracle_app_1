// scripts/check_balances.js
require("dotenv").config();
const ethers = require("ethers");
const fs = require("fs");

const rwaAbi = JSON.parse(fs.readFileSync("abi/AssetOracleToken.json", "utf8")).abi;

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const ast = new ethers.Contract(process.env.AST_ADDRESS, rwaAbi, wallet);

async function main() {
  const balance = await ast.balanceOf(wallet.address);
  const allowance = await ast.allowance(wallet.address, process.env.VAULT_SWAP_ADDRESS);

  console.log(`🔢 RWA Token Balance: ${ethers.formatUnits(balance, 18)}`);
  console.log(`✅ Allowance for VaultSwap: ${ethers.formatUnits(allowance, 18)}`);
}

main();
