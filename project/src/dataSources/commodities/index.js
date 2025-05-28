import { initializeLogger } from '../../utils/logger.js';

const logger = initializeLogger('commoditiesDataSources');

export function createCommoditiesDataSources(enabledSources) {
  logger.info(`Creating commodities data sources for: ${enabledSources.join(', ')}`);
  
  // Initialize an empty array to store the data sources
  const sources = [];
  
  // Return the initialized data sources
  // Currently returns an empty array as no commodity sources are implemented yet
  return sources;
}