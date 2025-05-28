// Configuration settings for the oracle system

export const config = {
  // General settings
  oracleUpdateInterval: process.env.ORACLE_UPDATE_INTERVAL || 60000, // 1 minute default
  minimumSourcesRequired: process.env.MINIMUM_SOURCES_REQUIRED || 3,
  
  // Price aggregation settings
  outlierDeviationThreshold: process.env.OUTLIER_DEVIATION_THRESHOLD || 0.05, // 5% deviation
  confidenceThreshold: process.env.CONFIDENCE_THRESHOLD || 0.8, // 80% confidence required
  
  // Blockchain settings
  web3Provider: process.env.WEB3_PROVIDER || 'http://localhost:8545',
  contractAddress: process.env.CONTRACT_ADDRESS,
  contractAbi: JSON.parse(process.env.CONTRACT_ABI || '[]'),
  privateKey: process.env.PRIVATE_KEY,
  
  // Data source settings
  dataSources: {
    crypto: [
      { name: 'binance', weight: 1.0, enabled: true },
      { name: 'coinbase', weight: 1.0, enabled: true },
      { name: 'kraken', weight: 1.0, enabled: true },
      { name: 'kucoin', weight: 0.8, enabled: true }
    ],
    realEstate: [
      { name: 'zillow', weight: 1.0, enabled: true },
      { name: 'realtor', weight: 0.9, enabled: true },
      { name: 'redfin', weight: 0.8, enabled: true }
    ],
    commodities: [
      { name: 'bloomberg', weight: 1.0, enabled: true },
      { name: 'reuters', weight: 1.0, enabled: true },
      { name: 'tradingeconomics', weight: 0.8, enabled: true }
    ]
  },
  
  // Failover settings
  maxFailedAttempts: process.env.MAX_FAILED_ATTEMPTS || 3,
  failoverRetryInterval: process.env.FAILOVER_RETRY_INTERVAL || 30000, // 30 seconds
  
  // Logging settings
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Web server settings
  port: process.env.PORT || 3000,
  
  // Redis cache settings (optional for performance)
  redisUrl: process.env.REDIS_URL,
  cacheExpiry: process.env.CACHE_EXPIRY || 60 // 60 seconds
};

// Dynamically determine which asset types are enabled
export function getEnabledAssetTypes() {
  return Object.keys(config.dataSources).filter(assetType => {
    return config.dataSources[assetType].some(source => source.enabled);
  });
}

// Get enabled data sources for a specific asset type
export function getEnabledDataSources(assetType) {
  if (!config.dataSources[assetType]) {
    return [];
  }
  
  return config.dataSources[assetType].filter(source => source.enabled);
}