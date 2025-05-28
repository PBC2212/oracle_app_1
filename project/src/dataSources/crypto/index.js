import { createBinanceDataSource } from './binance.js';
import { createCoinbaseDataSource } from './coinbase.js';
import { createKrakenDataSource } from './kraken.js';
import { createKucoinDataSource } from './kucoin.js';
import { initializeLogger } from '../../utils/logger.js';

const logger = initializeLogger('cryptoDataSources');

// Create all enabled crypto data sources
export async function createCryptoDataSources(enabledSources) {
  logger.info(`Creating ${enabledSources.length} crypto data sources`);
  
  const dataSources = [];
  
  for (const sourceConfig of enabledSources) {
    try {
      const dataSource = await createCryptoDataSource(sourceConfig);
      if (dataSource) {
        dataSources.push(dataSource);
      }
    } catch (error) {
      logger.error(`Failed to create crypto data source ${sourceConfig.name}:`, error);
    }
  }
  
  return dataSources;
}

// Create a specific crypto data source
async function createCryptoDataSource(sourceConfig) {
  logger.info(`Creating crypto data source: ${sourceConfig.name}`);
  
  switch (sourceConfig.name.toLowerCase()) {
    case 'binance':
      return createBinanceDataSource(sourceConfig);
    case 'coinbase':
      return createCoinbaseDataSource(sourceConfig);
    case 'kraken':
      return createKrakenDataSource(sourceConfig);
    case 'kucoin':
      return createKucoinDataSource(sourceConfig);
    default:
      logger.warn(`Unknown crypto data source: ${sourceConfig.name}`);
      return null;
  }
}