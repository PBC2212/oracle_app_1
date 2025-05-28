require("dotenv").config();
const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const lpWallet = new ethers.Wallet(process.env.LP_PRIVATE_KEY, provider);
const tx = {
  to: process.env.USER_ADDRESS,
  value: ethers.parseEther("0.01"),
};

async function main() {
  const sent = await lpWallet.sendTransaction(tx);
  console.log("⏳ Sending 0.01 ETH...");
  await sent.wait();
  console.log("✅ Sent! Hash:", sent.hash);
}

main();
