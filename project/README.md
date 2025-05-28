# Custom Oracle Solution

A scalable oracle system that aggregates real-time price data for assets from multiple trusted sources and provides reliable price feeds to blockchain smart contracts.

## Overview

This oracle solution is designed to:

1. Pull live price feeds from multiple trusted sources for various asset types
2. Normalize and average pricing data to eliminate outliers or manipulation
3. Provide trusted price feeds to smart contracts on Ethereum, BSC, or other blockchains
4. Include failover logic for source reliability
5. Support asset tokenization with 1:1 value minting

## Features

- **Multi-source Data Aggregation**: Collects price data from multiple exchanges and APIs
- **Asset Type Adapters**: Modular design to support different asset classes (crypto, real estate, commodities)
- **Price Normalization**: Advanced algorithms to detect and remove outlier prices
- **Confidence Scoring**: Evaluates price reliability based on source agreement
- **Smart Contract Integration**: Publishes verified prices to blockchain
- **Tokenization Support**: Enables 1:1 token minting based on asset value
- **Failover Mechanisms**: Ensures system reliability when sources are unavailable
- **Monitoring Dashboard**: Visualizes oracle performance and data quality

## Getting Started

### Prerequisites

- Node.js v16+
- Ethereum wallet with private key (for blockchain interactions)
- API keys for supported data sources

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy the example environment file:
   ```
   cp .env.example .env
   ```
4. Update the `.env` file with your API keys and configuration
5. Start the oracle:
   ```
   npm start
   ```

## Configuration

The oracle system is highly configurable through the `.env` file and `config/index.js`. Key configuration options include:

- **Update Interval**: How frequently prices are fetched and published
- **Source Weighting**: Importance assigned to each price source
- **Outlier Thresholds**: Parameters for detecting invalid prices
- **Confidence Requirements**: Minimum confidence needed for price publishing
- **Blockchain Settings**: Provider URLs and contract addresses

## Architecture

The system consists of several key components:

1. **Data Source Adapters**: API clients for different price sources
2. **Price Aggregator**: Combines and normalizes price data
3. **Smart Contract Interface**: Publishes verified prices to blockchain
4. **Asset Registry**: Manages asset information and ownership
5. **Tokenization Logic**: Mints tokens based on verified asset values
6. **Web Dashboard**: Provides monitoring and management interface

## Data Sources

The oracle supports multiple data sources for each asset type:

- **Crypto**: Binance, Coinbase, Kraken, KuCoin
- **Real Estate**: Zillow, Realtor, Redfin
- **Commodities**: Bloomberg, Reuters, Trading Economics

Additional sources can be added by creating new adapter modules.

## Smart Contract

The included `AssetPriceOracle.sol` contract provides:

- Price data storage and retrieval
- Asset registration and ownership tracking
- Token minting based on asset value
- 1:1 token redemption for stablecoins

## Dashboard

The web dashboard provides:

- Real-time price visualization
- Data source health monitoring
- Price confidence metrics
- System performance statistics

## License

This project is licensed under the MIT License - see the LICENSE file for details.