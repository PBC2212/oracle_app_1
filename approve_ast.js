require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');

// Load ABI
const rwaAbi = JSON.parse(fs.readFileSync('./abi/AssetOracleToken.json')).abi;

// Env vars
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.USER_PRIVATE_KEY, provider);

// Correct env var names
const RWA_ADDRESS = process.env.AST_ADDRESS;
const VAULT_ADDRESS = process.env.VAULT_SWAP_ADDRESS;
const AMOUNT = ethers.parseUnits('100000', 18); // approve 100,000 RWA

async function main() {
  const rwaToken = new ethers.Contract(RWA_ADDRESS, rwaAbi, wallet);

  console.log(`🔐 Approving ${AMOUNT} RWA to VaultSwap...`);
  const tx = await rwaToken.approve(VAULT_ADDRESS, AMOUNT);
  await tx.wait();
  console.log('✅ Approval successful:', tx.hash);
}

main().catch(err => console.error('❌ Error:', err));
