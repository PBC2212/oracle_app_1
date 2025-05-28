import { ethers } from 'ethers';
import { config } from '../config/index.js';
import { initializeLogger } from '../utils/logger.js';

const logger = initializeLogger('pricePublisher');
let provider;
let wallet;
let contract;

// Initialize blockchain connection
export async function initializeBlockchain() {
  logger.info('Initializing blockchain connection');
  
  try {
    // Connect to blockchain provider
    provider = new ethers.providers.JsonRpcProvider(config.web3Provider);
    logger.info(`Connected to blockchain at ${config.web3Provider}`);
    
    // Create wallet from private key
    if (config.privateKey) {
      wallet = new ethers.Wallet(config.privateKey, provider);
      logger.info('Wallet created successfully');
    } else {
      logger.warn('No private key provided, operating in read-only mode');
    }
    
    // Connect to oracle contract
    if (config.contractAddress && config.contractAbi) {
      contract = new ethers.Contract(
        config.contractAddress,
        config.contractAbi,
        wallet || provider
      );
      logger.info(`Connected to contract at ${config.contractAddress}`);
    } else {
      logger.warn('No contract address or ABI provided, price publishing disabled');
    }
    
    return { provider, wallet, contract };
  } catch (error) {
    logger.error('Failed to initialize blockchain connection:', error);
    throw error;
  }
}

// Publish price to blockchain
export async function publishPriceToBlockchain(assetType, assetId, priceData) {
  logger.info(`Publishing price for ${assetType}:${assetId} to blockchain`);
  
  if (!contract || !wallet) {
    logger.error('Blockchain connection not initialized');
    return false;
  }
  
  try {
    // Convert price to the format expected by the smart contract
    // Typically this would be an integer with appropriate decimal scaling
    const scaledPrice = ethers.utils.parseUnits(
      priceData.price.toString(),
      18 // Assuming 18 decimals, adjust as needed
    );
    
    // Call the updatePrice function on the smart contract
    // The exact function name and parameters would depend on your contract
    const tx = await contract.updatePrice(
      formatAssetIdForContract(assetType, assetId),
      scaledPrice,
      priceData.timestamp,
      Math.floor(priceData.confidence * 100) // Convert to percentage
    );
    
    logger.info(`Transaction submitted: ${tx.hash}`);
    
    // Wait for transaction confirmation
    const receipt = await tx.wait();
    logger.info(`Price published successfully, block: ${receipt.blockNumber}`);
    
    return true;
  } catch (error) {
    logger.error(`Failed to publish price to blockchain:`, error);
    return false;
  }
}

// Format asset ID for contract
function formatAssetIdForContract(assetType, assetId) {
  // Convert asset type and ID to the format expected by the smart contract
  // This depends on your specific contract implementation
  // For example, you might use a bytes32 hash of the asset type and ID
  return ethers.utils.id(`${assetType}:${assetId}`);
}