import axios from 'axios';
import { initializeLogger } from '../../utils/logger.js';

const logger = initializeLogger('binanceDataSource');

// Create Binance data source
export function createBinanceDataSource(config) {
  logger.info('Initializing Binance data source');
  
  const baseUrl = 'https://api.binance.com';
  
  // Test the connection to Binance API
  return axios.get(`${baseUrl}/api/v3/ping`)
    .then(() => {
      logger.info('Successfully connected to Binance API');
      
      return {
        name: 'binance',
        weight: config.weight,
        
        // Fetch price for a specific asset
        fetchPrice: async (assetId) => {
          try {
            // For crypto assets, assetId should be a trading pair like 'BTCUSDT'
            const response = await axios.get(`${baseUrl}/api/v3/ticker/price`, {
              params: { symbol: assetId }
            });
            
            if (response.data && response.data.price) {
              logger.debug(`Binance price for ${assetId}: ${response.data.price}`);
              return parseFloat(response.data.price);
            } else {
              throw new Error(`Invalid response from Binance for ${assetId}`);
            }
          } catch (error) {
            logger.error(`Error fetching price from Binance for ${assetId}:`, error);
            throw error;
          }
        },
        
        // Check if the source is available
        checkHealth: async () => {
          try {
            await axios.get(`${baseUrl}/api/v3/ping`);
            return true;
          } catch (error) {
            logger.error('Binance API health check failed:', error);
            return false;
          }
        }
      };
    })
    .catch(error => {
      logger.error('Failed to connect to Binance API:', error);
      throw error;
    });
}