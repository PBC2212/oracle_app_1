const { ethers } = require("ethers");
require("dotenv").config();

// Import the ABI JSON
const oracleABI = require("./OracleABI.json");

// Set up provider and wallet
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Connect to deployed contract
const oracleContract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  oracleABI,
  wallet
);

// Expose a function to mint tokens
async function mintTokensForAsset(user, amount) {
  const tx = await oracleContract.mintAssetToken(
    user,
    ethers.parseUnits(amount.toString(), 18)
  );
  await tx.wait();
  console.log(`✅ Minted ${amount} tokens to ${user}`);
}

module.exports = {
  mintTokensForAsset,
};
