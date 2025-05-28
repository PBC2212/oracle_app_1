require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// Load ABI
const abiPath = path.join(__dirname, "abi", "AssetOracleToken.json");
const abi = JSON.parse(fs.readFileSync(abiPath, "utf8")).abi;

// Setup provider and wallet
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Connect to contract
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, wallet);

// Load property data
const properties = JSON.parse(
  fs.readFileSync(path.join(__dirname, "mock_prices.json"), "utf8")
).properties;

// Optional delay function
function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function mintForProperty(property) {
  const { address, price } = property;
  const amount = ethers.parseUnits(price.toString(), 18);

  console.log(`\n🏠 Processing: ${address} – $${price}`);

  try {
    const tx = await contract.mintAssetToken(wallet.address, amount);
    console.log("⏳ Transaction sent:", tx.hash);

    await tx.wait();
    console.log(`✅ Mint confirmed for ${address}`);
  } catch (err) {
    console.error(`❌ Error minting for ${address}:`, err.message || err);
  }
}

async function main() {
  for (const property of properties) {
    await mintForProperty(property);
    await delay(2000); // wait 2 seconds between mints
  }
}

main().catch(console.error);
