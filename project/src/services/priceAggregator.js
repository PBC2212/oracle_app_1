import schedule from 'node-schedule';
import { fetchPriceData } from '../dataSources/index.js';
import { getEnabledAssetTypes } from '../config/index.js';
import { config } from '../config/index.js';
import { initializeLogger } from '../utils/logger.js';
import { publishPriceToBlockchain } from '../blockchain/pricePublisher.js';
import { EventEmitter } from 'events';

const logger = initializeLogger('priceAggregator');
const priceEvents = new EventEmitter();

// Current price data storage
const currentPrices = new Map();

// Start the price aggregation service
export function startPriceAggregator() {
  logger.info('Starting price aggregator service');
  
  const enabledAssetTypes = getEnabledAssetTypes();
  logger.info(`Monitoring prices for asset types: ${enabledAssetTypes.join(', ')}`);
  
  // Schedule regular price updates
  const updateInterval = config.oracleUpdateInterval;
  logger.info(`Setting update interval to ${updateInterval}ms`);
  
  // Start periodic price updates
  schedule.scheduleJob(`*/${Math.ceil(updateInterval/60000)} * * * *`, async () => {
    try {
      await updateAllPrices();
    } catch (error) {
      logger.error('Failed to update prices:', error);
    }
  });
  
  // Return the price aggregator interface
  return {
    // Get the current price for an asset
    getCurrentPrice: (assetType, assetId) => {
      const key = `${assetType}:${assetId}`;
      return currentPrices.get(key);
    },
    
    // Request an immediate price update for an asset
    requestPriceUpdate: async (assetType, assetId) => {
      return updatePrice(assetType, assetId);
    },
    
    // Subscribe to price updates
    onPriceUpdated: (listener) => {
      priceEvents.on('priceUpdated', listener);
      return () => priceEvents.off('priceUpdated', listener);
    },
    
    // Get all current prices
    getAllPrices: () => {
      return Array.from(currentPrices.entries()).reduce((acc, [key, value]) => {
        const [assetType, assetId] = key.split(':');
        if (!acc[assetType]) {
          acc[assetType] = {};
        }
        acc[assetType][assetId] = value;
        return acc;
      }, {});
    }
  };
}

// Update prices for all assets
async function updateAllPrices() {
  logger.info('Updating prices for all monitored assets');
  
  const enabledAssetTypes = getEnabledAssetTypes();
  const updatePromises = [];
  
  for (const assetType of enabledAssetTypes) {
    // In a real implementation, you would have a list of assets to monitor
    // For this example, we're using placeholder asset IDs
    const assetIds = getAssetIdsForType(assetType);
    
    for (const assetId of assetIds) {
      updatePromises.push(updatePrice(assetType, assetId));
    }
  }
  
  await Promise.all(updatePromises);
  logger.info('Completed price updates for all assets');
}

// Update price for a specific asset
async function updatePrice(assetType, assetId) {
  const key = `${assetType}:${assetId}`;
  logger.info(`Updating price for ${key}`);
  
  try {
    // Fetch prices from all data sources
    const prices = await fetchPriceData(assetType, assetId);
    
    if (!prices || prices.length === 0) {
      logger.warn(`No price data available for ${key}`);
      return null;
    }
    
    // Calculate aggregated price
    const aggregatedPrice = calculateAggregatedPrice(prices);
    logger.info(`Aggregated price for ${key}: ${aggregatedPrice.price}`);
    
    // Store the current price
    currentPrices.set(key, aggregatedPrice);
    
    // Emit price updated event
    priceEvents.emit('priceUpdated', {
      assetType,
      assetId,
      price: aggregatedPrice
    });
    
    // Publish price to blockchain if confidence is high enough
    if (aggregatedPrice.confidence >= config.confidenceThreshold) {
      await publishPriceToBlockchain(assetType, assetId, aggregatedPrice);
    } else {
      logger.warn(`Confidence too low (${aggregatedPrice.confidence}) to publish price for ${key}`);
    }
    
    return aggregatedPrice;
  } catch (error) {
    logger.error(`Failed to update price for ${key}:`, error);
    throw error;
  }
}

// Calculate aggregated price from multiple sources
function calculateAggregatedPrice(prices) {
  // Step 1: Remove outliers
  const filteredPrices = removeOutliers(prices);
  
  if (filteredPrices.length < config.minimumSourcesRequired) {
    logger.warn(`Not enough valid sources after filtering outliers: ${filteredPrices.length}/${prices.length}`);
  }
  
  // Step 2: Calculate weighted average
  let weightedSum = 0;
  let totalWeight = 0;
  
  for (const priceData of filteredPrices) {
    weightedSum += priceData.price * priceData.weight;
    totalWeight += priceData.weight;
  }
  
  const averagePrice = totalWeight > 0 ? weightedSum / totalWeight : 0;
  
  // Step 3: Calculate confidence score based on number of sources and their agreement
  const confidence = calculateConfidence(filteredPrices, averagePrice);
  
  return {
    price: averagePrice,
    timestamp: Date.now(),
    confidence: confidence,
    numSources: filteredPrices.length,
    sources: filteredPrices.map(p => p.source)
  };
}

// Remove outliers from price data
function removeOutliers(prices) {
  if (prices.length <= 2) {
    return prices; // Need at least 3 prices to identify outliers
  }
  
  // Calculate mean price
  const sum = prices.reduce((acc, p) => acc + p.price, 0);
  const mean = sum / prices.length;
  
  // Calculate standard deviation
  const squaredDiffs = prices.map(p => Math.pow(p.price - mean, 2));
  const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / prices.length;
  const stdDev = Math.sqrt(variance);
  
  // Filter out prices that are too far from the mean
  const threshold = config.outlierDeviationThreshold * mean;
  
  return prices.filter(p => {
    const deviation = Math.abs(p.price - mean);
    return deviation <= threshold;
  });
}

// Calculate confidence score based on source agreement
function calculateConfidence(prices, averagePrice) {
  if (prices.length === 0) {
    return 0;
  }
  
  // Calculate average deviation from the mean
  const totalDeviation = prices.reduce((acc, p) => {
    return acc + Math.abs(p.price - averagePrice) / averagePrice;
  }, 0);
  
  const averageDeviation = totalDeviation / prices.length;
  
  // Higher deviation = lower confidence
  let confidence = 1 - (averageDeviation * 5); // Scale factor of 5 to make confidence more sensitive
  
  // Adjust confidence based on number of sources
  const minSources = config.minimumSourcesRequired;
  const sourceFactor = Math.min(1, prices.length / minSources);
  
  confidence *= sourceFactor;
  
  // Ensure confidence is between 0 and 1
  return Math.max(0, Math.min(1, confidence));
}

// Get asset IDs to monitor for a specific asset type
function getAssetIdsForType(assetType) {
  // In a real implementation, this would come from configuration or database
  // For this example, we're returning placeholder asset IDs
  switch (assetType) {
    case 'crypto':
      return ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'];
    case 'realEstate':
      return ['property-123', 'property-456', 'property-789'];
    case 'commodities':
      return ['GOLD', 'SILVER', 'OIL'];
    default:
      return [];
  }
}