import { getEnabledAssetTypes, getEnabledDataSources } from '../config/index.js';
import { createCryptoDataSources } from './crypto/index.js';
import { createRealEstateDataSources } from './realEstate/index.js';
import { createCommoditiesDataSources } from './commodities/index.js';
import { initializeLogger } from '../utils/logger.js';

const logger = initializeLogger('dataSources');
const dataSources = {};

// Initialize all enabled data sources
export async function initializeDataSources() {
  const enabledAssetTypes = getEnabledAssetTypes();
  
  logger.info(`Initializing data sources for asset types: ${enabledAssetTypes.join(', ')}`);
  
  for (const assetType of enabledAssetTypes) {
    dataSources[assetType] = await initializeDataSourcesForAssetType(assetType);
  }
  
  return dataSources;
}

// Initialize data sources for a specific asset type
async function initializeDataSourcesForAssetType(assetType) {
  const enabledSources = getEnabledDataSources(assetType);
  
  logger.info(`Initializing ${enabledSources.length} data sources for ${assetType}`);
  
  switch (assetType) {
    case 'crypto':
      return createCryptoDataSources(enabledSources);
    case 'realEstate':
      return createRealEstateDataSources(enabledSources);
    case 'commodities':
      return createCommoditiesDataSources(enabledSources);
    default:
      logger.warn(`Unknown asset type: ${assetType}`);
      return [];
  }
}

// Get all active data sources
export function getAllDataSources() {
  return dataSources;
}

// Get data sources for a specific asset type
export function getDataSourcesForAssetType(assetType) {
  return dataSources[assetType] || [];
}

// Fetch price data from all enabled data sources for a specific asset
export async function fetchPriceData(assetType, assetId) {
  const sources = getDataSourcesForAssetType(assetType);
  
  if (!sources || sources.length === 0) {
    logger.error(`No data sources available for asset type: ${assetType}`);
    throw new Error(`No data sources available for asset type: ${assetType}`);
  }
  
  logger.info(`Fetching price data for ${assetType}:${assetId} from ${sources.length} sources`);
  
  const pricePromises = sources.map(source => {
    return fetchPriceFromSource(source, assetId)
      .catch(error => {
        logger.error(`Failed to fetch price from ${source.name} for ${assetType}:${assetId}:`, error);
        return null; // Return null for failed sources
      });
  });
  
  const prices = await Promise.all(pricePromises);
  
  // Filter out failed sources
  const validPrices = prices.filter(price => price !== null);
  
  logger.info(`Received ${validPrices.length} valid prices for ${assetType}:${assetId}`);
  
  return validPrices;
}

// Fetch price from a specific data source
async function fetchPriceFromSource(source, assetId) {
  try {
    const price = await source.fetchPrice(assetId);
    
    return {
      source: source.name,
      price: price,
      timestamp: Date.now(),
      weight: source.weight
    };
  } catch (error) {
    logger.error(`Error fetching price from ${source.name}:`, error);
    throw error;
  }
}