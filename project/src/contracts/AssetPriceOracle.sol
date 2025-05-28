// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title AssetPriceOracle
 * @dev Smart contract for receiving asset price data from trusted oracles
 * and minting tokens based on asset values
 */
contract AssetPriceOracle {
    // Address of the contract owner
    address public owner;
    
    // Addresses of trusted oracles that can update prices
    mapping(address => bool) public trustedOracles;
    
    // Price data structure
    struct PriceData {
        uint256 price;
        uint256 timestamp;
        uint8 confidence;
        bool exists;
    }
    
    // Asset structure
    struct Asset {
        bytes32 assetId;
        string assetType;
        address owner;
        bool tokenized;
        uint256 tokensMinted;
    }
    
    // Mapping from asset ID to price data
    mapping(bytes32 => PriceData) public assetPrices;
    
    // Mapping from asset ID to asset data
    mapping(bytes32 => Asset) public registeredAssets;
    
    // ERC20 token balance for each address
    mapping(address => uint256) public tokenBalances;
    
    // Total supply of tokens
    uint256 public totalSupply;
    
    // Events
    event PriceUpdated(bytes32 indexed assetId, uint256 price, uint256 timestamp, uint8 confidence);
    event PriceRequested(bytes32 indexed assetId, address requester);
    event AssetRegistered(bytes32 indexed assetId, string assetType, address owner);
    event TokensMinted(bytes32 indexed assetId, address owner, uint256 amount);
    event TokensRedeemed(address indexed redeemer, uint256 amount);
    
    /**
     * @dev Constructor to set the contract owner
     */
    constructor() {
        owner = msg.sender;
        trustedOracles[msg.sender] = true;
    }
    
    /**
     * @dev Modifier to restrict function access to the owner
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    /**
     * @dev Modifier to restrict function access to trusted oracles
     */
    modifier onlyTrustedOracle() {
        require(trustedOracles[msg.sender], "Only trusted oracles can call this function");
        _;
    }
    
    /**
     * @dev Add a trusted oracle
     * @param oracleAddress Address of the oracle to add
     */
    function addTrustedOracle(address oracleAddress) external onlyOwner {
        trustedOracles[oracleAddress] = true;
    }
    
    /**
     * @dev Remove a trusted oracle
     * @param oracleAddress Address of the oracle to remove
     */
    function removeTrustedOracle(address oracleAddress) external onlyOwner {
        trustedOracles[oracleAddress] = false;
    }
    
    /**
     * @dev Update price data for an asset
     * @param assetId Unique identifier for the asset
     * @param price Current price of the asset in USD (scaled by 1e18)
     * @param timestamp Timestamp when the price was updated
     * @param confidence Confidence level of the price (0-100)
     */
    function updatePrice(bytes32 assetId, uint256 price, uint256 timestamp, uint8 confidence) 
        external 
        onlyTrustedOracle 
    {
        require(confidence <= 100, "Confidence must be between 0 and 100");
        require(timestamp <= block.timestamp, "Timestamp cannot be in the future");
        
        // Only update if the price is newer
        if (!assetPrices[assetId].exists || timestamp > assetPrices[assetId].timestamp) {
            assetPrices[assetId] = PriceData({
                price: price,
                timestamp: timestamp,
                confidence: confidence,
                exists: true
            });
            
            emit PriceUpdated(assetId, price, timestamp, confidence);
        }
    }
    
    /**
     * @dev Request a price update for an asset
     * @param assetId Unique identifier for the asset
     */
    function requestPriceUpdate(bytes32 assetId) external {
        emit PriceRequested(assetId, msg.sender);
    }
    
    /**
     * @dev Register a new asset
     * @param assetId Unique identifier for the asset
     * @param assetType Type of the asset (e.g., "realEstate", "crypto")
     */
    function registerAsset(bytes32 assetId, string calldata assetType) external {
        require(!registeredAssets[assetId].exists, "Asset already registered");
        
        registeredAssets[assetId] = Asset({
            assetId: assetId,
            assetType: assetType,
            owner: msg.sender,
            tokenized: false,
            tokensMinted: 0
        });
        
        emit AssetRegistered(assetId, assetType, msg.sender);
        
        // Automatically request a price update for the new asset
        emit PriceRequested(assetId, msg.sender);
    }
    
    /**
     * @dev Mint tokens based on asset value
     * @param assetId Unique identifier for the asset
     */
    function mintTokens(bytes32 assetId) external {
        Asset storage asset = registeredAssets[assetId];
        
        require(asset.exists, "Asset not registered");
        require(asset.owner == msg.sender, "Only asset owner can mint tokens");
        require(!asset.tokenized, "Asset already tokenized");
        require(assetPrices[assetId].exists, "No price data available for asset");
        require(assetPrices[assetId].confidence >= 80, "Price confidence too low");
        require(block.timestamp - assetPrices[assetId].timestamp <= 1 days, "Price data too old");
        
        // Calculate tokens to mint (1:1 with USD value)
        uint256 assetValue = assetPrices[assetId].price / 1e18; // Convert from wei to whole tokens
        
        // Update asset state
        asset.tokenized = true;
        asset.tokensMinted = assetValue;
        
        // Update token balances
        tokenBalances[msg.sender] += assetValue;
        totalSupply += assetValue;
        
        emit TokensMinted(assetId, msg.sender, assetValue);
    }
    
    /**
     * @dev Redeem tokens for stablecoins (USDC/USDT)
     * @param amount Amount of tokens to redeem
     * @notice This function would interact with a stablecoin contract in a real implementation
     */
    function redeemTokens(uint256 amount) external {
        require(tokenBalances[msg.sender] >= amount, "Insufficient token balance");
        
        // Update token balances
        tokenBalances[msg.sender] -= amount;
        totalSupply -= amount;
        
        // In a real implementation, this would transfer stablecoins to the user
        // For this example, we're just emitting an event
        emit TokensRedeemed(msg.sender, amount);
    }
    
    /**
     * @dev Get current price data for an asset
     * @param assetId Unique identifier for the asset
     * @return price Current price of the asset
     * @return timestamp Timestamp when the price was last updated
     * @return confidence Confidence level of the price
     */
    function getAssetPrice(bytes32 assetId) external view returns (uint256 price, uint256 timestamp, uint8 confidence) {
        require(assetPrices[assetId].exists, "No price data available for asset");
        
        PriceData memory data = assetPrices[assetId];
        return (data.price, data.timestamp, data.confidence);
    }
    
    /**
     * @dev Transfer tokens to another address
     * @param to Recipient address
     * @param amount Amount of tokens to transfer
     * @return success Whether the transfer was successful
     */
    function transferTokens(address to, uint256 amount) external returns (bool success) {
        require(to != address(0), "Cannot transfer to zero address");
        require(tokenBalances[msg.sender] >= amount, "Insufficient token balance");
        
        tokenBalances[msg.sender] -= amount;
        tokenBalances[to] += amount;
        
        return true;
    }
}