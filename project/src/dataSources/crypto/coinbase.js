import axios from 'axios';
import { initializeLogger } from '../../utils/logger.js';

const logger = initializeLogger('coinbaseDataSource');

// Create Coinbase data source
export function createCoinbaseDataSource(config) {
  logger.info('Initializing Coinbase data source');
  
  const baseUrl = 'https://api.coinbase.com';
  
  // Test the connection to Coinbase API
  return axios.get(`${baseUrl}/v2/time`)
    .then(() => {
      logger.info('Successfully connected to Coinbase API');
      
      return {
        name: 'coinbase',
        weight: config.weight,
        
        // Fetch price for a specific asset
        fetchPrice: async (assetId) => {
          try {
            // For Coinbase, we need to format the trading pair as 'BTC-USD'
            const formattedAssetId = formatAssetIdForCoinbase(assetId);
            const response = await axios.get(`${baseUrl}/v2/prices/${formattedAssetId}/spot`);
            
            if (response.data && response.data.data && response.data.data.amount) {
              logger.debug(`Coinbase price for ${assetId}: ${response.data.data.amount}`);
              return parseFloat(response.data.data.amount);
            } else {
              throw new Error(`Invalid response from Coinbase for ${assetId}`);
            }
          } catch (error) {
            logger.error(`Error fetching price from Coinbase for ${assetId}:`, error);
            throw error;
          }
        },
        
        // Check if the source is available
        checkHealth: async () => {
          try {
            await axios.get(`${baseUrl}/v2/time`);
            return true;
          } catch (error) {
            logger.error('Coinbase API health check failed:', error);
            return false;
          }
        }
      };
    })
    .catch(error => {
      logger.error('Failed to connect to Coinbase API:', error);
      throw error;
    });
}

// Format asset ID for Coinbase API (e.g., 'BTCUSDT' -> 'BTC-USD')
function formatAssetIdForCoinbase(assetId) {
  // Simple conversion for common trading pairs
  if (assetId.endsWith('USDT')) {
    return `${assetId.slice(0, -4)}-USD`;
  } else if (assetId.length >= 6) {
    // Assume the last 3-4 characters are the quote currency
    const baseCurrency = assetId.slice(0, -3);
    const quoteCurrency = assetId.slice(-3);
    return `${baseCurrency}-${quoteCurrency}`;
  } else {
    return assetId;
  }
}