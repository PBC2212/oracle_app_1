require("dotenv").config();
const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.LP_PRIVATE_KEY, provider);

async function main() {
  const balance = await provider.getBalance(wallet.address);
  console.log(`LP Wallet Balance: ${ethers.formatEther(balance)} ETH`);
}

main();
