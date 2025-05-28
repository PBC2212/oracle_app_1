const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

// Load ABI
const abiPath = path.join(__dirname, "oracle", "abi", "AssetOracleToken.json");
const abi = JSON.parse(fs.readFileSync(abiPath)).abi;

// ✅ Update this after each deployment
const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

// Localhost provider (Hardhat)
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

// First Hardhat account — default oracle
const privateKey = "0x59c6995e998f97a5a0044966f0945383d5f93c3d0f7e6d0cfbaf8c34d7b7e1f2";
const wallet = new ethers.Wallet(privateKey, provider);

// Connect contract
const contract = new ethers.Contract(contractAddress, abi, wallet);

async function main() {
  const toAddress = await wallet.getAddress();
  const amount = ethers.parseEther("100"); // 100 tokens in wei

  const tx = await contract.mintAssetToken(toAddress, amount);
  await tx.wait();

  console.log(`✅ Minted 100 AST to ${toAddress}`);
}

main().catch(console.error);
