require("dotenv").config();
const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.LP_PRIVATE_KEY, provider);

const AST_ADDRESS = process.env.AST_ADDRESS;
const USDT_ADDRESS = process.env.STABLE_TOKEN_ADDRESS;
const UNISWAP_V3_ROUTER = process.env.UNISWAP_V3_ROUTER;

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() view returns (uint8)"
];

async function main() {
  const amountInAST = ethers.parseUnits("1", 18);
  const ast = new ethers.Contract(AST_ADDRESS, ERC20_ABI, wallet);
  const usdt = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, wallet);

  console.log("🔐 Approving AST to Uniswap V3 Router...");
  const approveTx = await ast.approve(UNISWAP_V3_ROUTER, amountInAST);
  await approveTx.wait();
  console.log("✅ Approval complete.");

  const router = new ethers.Contract(
    UNISWAP_V3_ROUTER,
    [
      "function exactInputSingle((address tokenIn,address tokenOut,uint24 fee,address recipient,uint256 deadline,uint256 amountIn,uint256 amountOutMinimum,uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)"
    ],
    wallet
  );

  const feeTier = 3000;
  const deadline = Math.floor(Date.now() / 1000) + 60 * 5;

  const params = {
    tokenIn: AST_ADDRESS,
    tokenOut: USDT_ADDRESS,
    fee: feeTier,
    recipient: wallet.address,
    deadline: deadline,
    amountIn: amountInAST,
    amountOutMinimum: 0n,
    sqrtPriceLimitX96: 0n
  };

  console.log("🔄 Swapping AST -> USDT via Uniswap V3...");
  try {
    const tx = await router.exactInputSingle(params);
    const receipt = await tx.wait();
    console.log("✅ Swap successful! Tx Hash:", receipt.hash);

    const usdtBalance = await usdt.balanceOf(wallet.address);
    console.log("💰 New USDT Balance:", ethers.formatUnits(usdtBalance, 6));
  } catch (err) {
    console.error("❌ Swap failed:", err.reason || err.message);
  }
}

main();
