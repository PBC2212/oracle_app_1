import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/index.js';
import { initializeLogger } from '../utils/logger.js';

const logger = initializeLogger('webServer');
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Setup web server for dashboard and API
export async function setupWebServer() {
  logger.info('Setting up web server');
  
  const app = express();
  const port = config.port || 3000;
  
  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // API routes
  setupApiRoutes(app);
  
  // Serve static dashboard files
  app.use(express.static(path.join(__dirname, '../../public')));
  
  // Catch-all route to serve the dashboard SPA
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
  });
  
  // Start the server
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      logger.info(`Web server listening on port ${port}`);
      resolve(server);
    });
    
    server.on('error', (error) => {
      logger.error('Failed to start web server:', error);
      reject(error);
    });
  });
}

// Setup API routes
function setupApiRoutes(app) {
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy' });
  });
  
  // Get all current prices
  app.get('/api/prices', (req, res) => {
    // In a real implementation, you would get this from the price aggregator
    // For this example, we're returning mock data
    res.json({
      crypto: {
        'BTCUSDT': { price: 50000, timestamp: Date.now() },
        'ETHUSDT': { price: 3000, timestamp: Date.now() }
      },
      realEstate: {
        'property-123': { price: 450000, timestamp: Date.now() }
      }
    });
  });
  
  // Get price for specific asset
  app.get('/api/prices/:assetType/:assetId', (req, res) => {
    const { assetType, assetId } = req.params;
    
    // In a real implementation, you would get this from the price aggregator
    // For this example, we're returning mock data
    res.json({
      assetType,
      assetId,
      price: 50000,
      timestamp: Date.now(),
      confidence: 0.95
    });
  });
  
  // Request price update
  app.post('/api/prices/:assetType/:assetId/update', (req, res) => {
    const { assetType, assetId } = req.params;
    
    logger.info(`Manual price update requested for ${assetType}:${assetId}`);
    
    // In a real implementation, you would call the price aggregator
    // For this example, we're just acknowledging the request
    res.json({
      status: 'updating',
      assetType,
      assetId
    });
  });
  
  // Get system status
  app.get('/api/status', (req, res) => {
    res.json({
      status: 'operational',
      dataSources: {
        crypto: [
          { name: 'binance', status: 'healthy' },
          { name: 'coinbase', status: 'healthy' }
        ],
        realEstate: [
          { name: 'zillow', status: 'healthy' }
        ]
      },
      blockchain: {
        status: 'connected',
        latestBlock: 12345678
      }
    });
  });
  
  // Define other API routes here
  logger.info('API routes configured');
}