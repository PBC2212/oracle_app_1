require("dotenv").config();
const { ethers } = require("ethers");
const AST_ABI = require("./abi/AssetoracleToken.json").abi;

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const ast = new ethers.Contract(process.env.AST_ADDRESS, AST_ABI, provider);

async function main() {
  const balance = await ast.balanceOf(process.env.USER_ADDRESS);
  console.log(`👤 AST Balance for USER: ${ethers.formatUnits(balance, 18)} AST`);
}

main();
