require("dotenv").config();
const ethers = require("ethers");
const fs = require("fs");

// ✅ Load only the ABI array
const AST_ABI = JSON.parse(fs.readFileSync("./abi/AssetOracleToken.json", "utf8")).abi;

// ✅ Set up provider and wallet
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.USER_PRIVATE_KEY, provider);

// ✅ Addresses from env
const astAddress = process.env.AST_ADDRESS;
const vaultSwapAddress = process.env.VAULT_SWAP_ADDRESS;

const approve = async () => {
  const token = new ethers.Contract(astAddress, AST_ABI, wallet);
  const amount = ethers.parseUnits("1000000", 18); // 1 million tokens

  try {
    const tx = await token.approve(vaultSwapAddress, amount);
    console.log("Approval tx sent:", tx.hash);
    await tx.wait();
    console.log("✅ Approval confirmed.");
  } catch (err) {
    console.error("❌ Approval failed:", err);
  }
};

approve();
