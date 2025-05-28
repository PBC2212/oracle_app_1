import { createZillowDataSource } from './zillow.js';
import { createRealtorDataSource } from './realtor.js';
import { createRedfinDataSource } from './redfin.js';
import { initializeLogger } from '../../utils/logger.js';

const logger = initializeLogger('realEstateDataSources');

// Create all enabled real estate data sources
export async function createRealEstateDataSources(enabledSources) {
  logger.info(`Creating ${enabledSources.length} real estate data sources`);
  
  const dataSources = [];
  
  for (const sourceConfig of enabledSources) {
    try {
      const dataSource = await createRealEstateDataSource(sourceConfig);
      if (dataSource) {
        dataSources.push(dataSource);
      }
    } catch (error) {
      logger.error(`Failed to create real estate data source ${sourceConfig.name}:`, error);
    }
  }
  
  return dataSources;
}

// Create a specific real estate data source
async function createRealEstateDataSource(sourceConfig) {
  logger.info(`Creating real estate data source: ${sourceConfig.name}`);
  
  switch (sourceConfig.name.toLowerCase()) {
    case 'zillow':
      return createZillowDataSource(sourceConfig);
    case 'realtor':
      return createRealtorDataSource(sourceConfig);
    case 'redfin':
      return createRedfinDataSource(sourceConfig);
    default:
      logger.warn(`Unknown real estate data source: ${sourceConfig.name}`);
      return null;
  }
}