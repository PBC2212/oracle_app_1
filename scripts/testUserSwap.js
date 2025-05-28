const hre = require("hardhat");

async function main() {
  const signers = await hre.ethers.getSigners();
  console.log(`📢 Total available signers: ${signers.length}`);
  signers.forEach((s, i) => console.log(`Signer ${i}: ${s.address}`));

  if (signers.length < 2) {
    throw new Error("❌ Not enough signers available from Hardhat local network.");
  }

  const [admin, user] = signers;

  const rwaTokenAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"; // AssetOracleToken
  const stableTokenAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"; // MockUSDT
  const vaultSwapAddress = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707"; // VaultSwap

  const AssetOracleToken = await hre.ethers.getContractAt("AssetOracleToken", rwaTokenAddress);
  const MockUSDT = await hre.ethers.getContractAt(
    "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
    stableTokenAddress
  );
  const VaultSwap = await hre.ethers.getContractAt("VaultSwap", vaultSwapAddress);

  const mintTx = await AssetOracleToken.connect(admin).mintAssetToken(user.address, hre.ethers.parseUnits("1000", 18));
  await mintTx.wait();
  console.log(`✅ Minted 1000 RWA tokens to user ${user.address}`);

  const approveTx = await AssetOracleToken.connect(user).approve(vaultSwapAddress, hre.ethers.parseUnits("1000", 18));
  await approveTx.wait();
  console.log(`✅ User approved VaultSwap to spend RWA tokens`);

  const fundTx = await MockUSDT.connect(admin).transfer(vaultSwapAddress, hre.ethers.parseUnits("1000", 18));
  await fundTx.wait();
  console.log(`✅ VaultSwap funded with 1000 USDT from admin`);

  const swapTx = await VaultSwap.connect(user).swap(hre.ethers.parseUnits("500", 18));
  await swapTx.wait();
  console.log(`✅ User swapped 500 RWA for USDT`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
