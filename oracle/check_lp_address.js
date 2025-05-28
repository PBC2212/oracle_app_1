require("dotenv").config();
const { Wallet } = require("ethers");

const wallet = new Wallet(process.env.LP_PRIVATE_KEY);
console.log(`📬 LP Wallet Address: ${wallet.address}`);
