require("dotenv").config();
const fs = require("fs");
const {
  JsonRpcProvider,
  Wallet,
  Contract,
  parseEther,
  formatEther,
  BigNumber
} = require("ethers");

// ✅ Load ABI
const vaultArtifact = JSON.parse(fs.readFileSync("./abi/VaultSwap.json", "utf8"));
const vaultAbi = vaultArtifact.abi;

// 🔧 Set up Sepolia RPC and signer
const provider = new JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
console.log("🔧 Loaded RPC:", process.env.SEPOLIA_RPC_URL);

const userWallet = new Wallet(process.env.USER_PRIVATE_KEY, provider);

// 📦 Load contract addresses
const vaultAddress = process.env.VAULT_SWAP_ADDRESS;
const astAddress = process.env.AST_ADDRESS;
const stableTokenAddress = process.env.STABLE_TOKEN_ADDRESS;

async function main() {
  const vault = new Contract(vaultAddress, vaultAbi, userWallet);
  const amountIn = parseEther("1");

  // 🧠 Set up simple ERC20 interface
  const erc20Abi = [
    "function balanceOf(address) view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)"
  ];
  const astToken = new Contract(astAddress, erc20Abi, provider);

  const userAddress = userWallet.address;

  console.log("👤 User:", userAddress);

  const balanceRaw = await astToken.balanceOf(userAddress);
  const allowanceRaw = await astToken.allowance(userAddress, vaultAddress);

  console.log("📊 Raw balance:", balanceRaw);
  console.log("📊 Raw allowance:", allowanceRaw);

  if (!balanceRaw || !allowanceRaw) {
    throw new Error("❌ Could not fetch balance or allowance. Check token or vault addresses.");
  }

  const balance = BigNumber.from(balanceRaw.toString());
  const allowance = BigNumber.from(allowanceRaw.toString());

  console.log("💰 AST balance:", formatEther(balance));
  console.log("✅ Allowance to Vault:", formatEther(allowance));

  if (balance.lt(amountIn)) {
    throw new Error("❌ Insufficient AST balance for swap.");
  }

  if (allowance.lt(amountIn)) {
    throw new Error("❌ AST allowance to Vault is too low. Please approve first.");
  }

  console.log("🔁 Sending swap transaction...");
  const tx = await vault.swap(amountIn);
  await tx.wait();
  console.log(`✅ SwapRequested tx sent: ${tx.hash}`);
}

main().catch((err) => {
  console.error("❌ Error running request_swap.js:", err);
});
