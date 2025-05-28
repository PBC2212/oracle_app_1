import express from 'express';
import dotenv from 'dotenv';
import { initializeDataSources } from './dataSources/index.js';
import { startPriceAggregator } from './services/priceAggregator.js';
import { setupSmartContractListener } from './blockchain/contractListener.js';
import { setupWebServer } from './server/webServer.js';
import { initializeLogger } from './utils/logger.js';

// Load environment variables
dotenv.config();

const logger = initializeLogger();

async function startOracle() {
  try {
    logger.info('Starting Custom Oracle Solution...');
    
    // Initialize data sources
    await initializeDataSources();
    logger.info('Data sources initialized successfully');
    
    // Start price aggregation service
    const aggregator = await startPriceAggregator();
    logger.info('Price aggregator started successfully');
    
    // Setup blockchain contract listener
    await setupSmartContractListener(aggregator);
    logger.info('Smart contract listener setup complete');
    
    // Start web server for dashboard and API
    await setupWebServer();
    logger.info('Web server started successfully');
    
    logger.info('Oracle system is now fully operational');
  } catch (error) {
    logger.error('Failed to start oracle system:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down oracle system...');
  // Implement cleanup logic here
  process.exit(0);
});

// Start the oracle system
startOracle();