require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");

// Load ABI
const vaultSwapAbi = require("./abi/VaultSwap.json").abi;

// Setup provider and signer
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const lpWallet = new ethers.Wallet(process.env.LP_PRIVATE_KEY, provider);

// Contract instances
const vaultSwap = new ethers.Contract(
  process.env.VAULT_SWAP_ADDRESS,
  vaultSwapAbi,
  lpWallet
);

// Stable token interface
const erc20Abi = [
  "function transfer(address to, uint256 amount) public returns (bool)",
  "function balanceOf(address owner) public view returns (uint256)"
];
const stableToken = new ethers.Contract(process.env.STABLE_TOKEN_ADDRESS, erc20Abi, lpWallet);

// Listener
console.log("📡 Listening for SwapRequested events on VaultSwap...");

vaultSwap.on("SwapRequested", async (user, amount, fee, event) => {
  try {
    console.log("🔔 Event received:");
    console.log("👤 User:", user);
    console.log("💸 Amount:", ethers.formatUnits(amount, 18));
    console.log("💰 Fee:", ethers.formatUnits(fee, 18));
    console.log("🧾 TX Hash:", event.transactionHash);

    const netAmount = amount - fee;
    const lpBalance = await stableToken.balanceOf(lpWallet.address);
    console.log(`💼 LP Wallet Balance: ${ethers.formatUnits(lpBalance, 18)} USDT`);

    if (lpBalance < netAmount) {
      console.error("❌ Not enough stable tokens in LP wallet.");
      return;
    }

    const tx = await stableToken.transfer(user, netAmount);
    await tx.wait();
    console.log(`✅ Sent ${ethers.formatUnits(netAmount, 18)} USDT to ${user}: ${tx.hash}`);
  } catch (err) {
    console.error("❌ Error in event handler:", err);
  }
});
