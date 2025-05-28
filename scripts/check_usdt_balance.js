require("dotenv").config();
const { ethers } = require("ethers");
const usdtAbi = require("../abi/MockUSDT.json");

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.LP_PRIVATE_KEY, provider);
  const usdt = new ethers.Contract(process.env.STABLE_TOKEN_ADDRESS, usdtAbi.abi, wallet);

  const balance = await usdt.balanceOf(wallet.address);
  console.log(`USDT balance of LP wallet: ${ethers.formatUnits(balance, 18)} USDT`);
}

main().catch(console.error);
