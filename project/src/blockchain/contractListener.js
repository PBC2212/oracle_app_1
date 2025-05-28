import { ethers } from 'ethers';
import { initializeBlockchain } from './pricePublisher.js';
import { config } from '../config/index.js';
import { initializeLogger } from '../utils/logger.js';

const logger = initializeLogger('contractListener');

// Setup smart contract listener
export async function setupSmartContractListener(priceAggregator) {
  logger.info('Setting up smart contract listener');
  
  try {
    // Initialize blockchain connection
    const { contract } = await initializeBlockchain();
    
    if (!contract) {
      logger.warn('No contract available, skipping listener setup');
      return false;
    }
    
    // Listen for price requests from the smart contract
    // The exact event name would depend on your contract
    contract.on('PriceRequested', async (assetId, requester, event) => {
      try {
        logger.info(`Price request received for asset: ${assetId} from: ${requester}`);
        
        // Parse the asset ID from the contract format
        const { assetType, id } = parseAssetIdFromContract(assetId);
        
        // Request an immediate price update
        const price = await priceAggregator.requestPriceUpdate(assetType, id);
        
        logger.info(`Price updated for ${assetType}:${id} in response to contract request`);
      } catch (error) {
        logger.error(`Error handling price request:`, error);
      }
    });
    
    // Listen for other relevant events
    // For example, new asset registrations
    contract.on('AssetRegistered', async (assetId, assetType, event) => {
      logger.info(`New asset registered: ${assetId} of type: ${assetType}`);
      // Add logic to handle new asset registration
    });
    
    logger.info('Smart contract listener setup complete');
    return true;
  } catch (error) {
    logger.error('Failed to setup contract listener:', error);
    return false;
  }
}

// Parse asset ID from contract format
function parseAssetIdFromContract(contractAssetId) {
  // This depends on how you've formatted the asset ID for the contract
  // For example, if you used a bytes32 hash, you might need to use an off-chain mapping
  
  // For this example, we're assuming a simple string format
  try {
    const assetIdString = ethers.utils.parseBytes32String(contractAssetId);
    const [assetType, id] = assetIdString.split(':');
    
    return { assetType, id };
  } catch (error) {
    logger.error(`Failed to parse asset ID from contract: ${contractAssetId}`, error);
    // Return a default value or throw an error
    return { assetType: 'unknown', id: contractAssetId };
  }
}