require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");

// Load ABIs
const vaultSwapAbi = require("./abi/VaultSwap.json");
const astAbi = require("./abi/AssetOracleToken.json");
const erc20Abi = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function decimals() view returns (uint8)"
];
const routerAbi = [
  "function exactInputSingle((address,address,uint24,address,uint256,uint256,uint160)) external payable returns (uint256)"
];

// Setup
const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.LP_PRIVATE_KEY, provider);

const vaultSwap = new ethers.Contract(process.env.VAULT_SWAP_ADDRESS, vaultSwapAbi, wallet);
const ast = new ethers.Contract(process.env.AST_ADDRESS, astAbi, wallet);
const usdt = new ethers.Contract(process.env.STABLE_TOKEN_ADDRESS, erc20Abi, wallet);
const router = new ethers.Contract(process.env.UNISWAP_V3_ROUTER, routerAbi, wallet);

// Uniswap pool fee tier (usually 0.3%)
const FEE_TIER = 3000;

async function handleSwap(user, amount) {
  try {
    console.log(`\n🔁 Detected SwapRequested: ${ethers.utils.formatUnits(amount, 18)} AST from ${user}`);

    // 1. Approve Uniswap Router
    const approveTx = await ast.approve(router.address, amount);
    await approveTx.wait();
    console.log("✅ Approved AST to Uniswap Router");

    // 2. Swap AST → USDT
    const swapParams = {
      tokenIn: ast.address,
      tokenOut: usdt.address,
      fee: FEE_TIER,
      recipient: wallet.address,
      deadline: Math.floor(Date.now() / 1000) + 600,
      amountIn: amount,
      amountOutMinimum: 0,
      sqrtPriceLimitX96: 0,
    };

    const tx = await router.exactInputSingle(swapParams, { gasLimit: 800000 });
    const receipt = await tx.wait();
    console.log(`✅ Swap completed. Tx: ${receipt.transactionHash}`);

    // 3. Send USDT to user
    const usdtDecimals = await usdt.decimals();
    const balance = await usdt.balanceOf(wallet.address);
    const transferTx = await usdt.transfer(user, balance);
    await transferTx.wait();
    console.log(`💸 Sent ${ethers.utils.formatUnits(balance, usdtDecimals)} USDT to ${user}`);
  } catch (err) {
    console.error("❌ Swap failed:", err.message);
  }
}

// Start listening
function start() {
  console.log("👂 LP Uniswap Listener running on Sepolia...");
  vaultSwap.on("SwapRequested", async (user, amount) => {
    await handleSwap(user, amount);
  });
}

start();
