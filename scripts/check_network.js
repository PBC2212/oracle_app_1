const { ethers } = require("ethers");

async function main() {
  const provider = new ethers.JsonRpcProvider("https://rpc.sepolia.org");
  const blockNumber = await provider.getBlockNumber();
  console.log("Latest block number on Sepolia:", blockNumber);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
