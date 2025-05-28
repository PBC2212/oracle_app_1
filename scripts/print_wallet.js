require("dotenv").config();
const { Wallet } = require("ethers");

const wallet = new Wallet(process.env.SEPOLIA_PRIVATE_KEY);
console.log("Your Sepolia wallet address is:", wallet.address);
