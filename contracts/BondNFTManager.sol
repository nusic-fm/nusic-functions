// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./RatingEngine.sol";
import "./BondNFTGenerator.sol";
import "./BondNFT.sol";
import "./AssetPool.sol";
import "hardhat/console.sol";


contract BondNFTManager is Ownable {

    using Strings for string;

    RatingEngine private ratingEngine;
    BondNFTGenerator private bondNFTGenerator;

    address usdcAddress;
    address manager;

    struct BondConfig {
        string artistName;
        string youtubeSongId;
        string soundchartsSongId;
        string songstatsSongId;
        //string youtubeArtistId;
        //string soundchartsSpotifyArtistId;
        //string songstatsSpotifyArtistId;
        uint256 fundingAmount;
        uint256 numberOfYears;
        uint256 numberOfBonds;
        address issuerAddress;
        uint256 faceValue;
        uint256 listeners;
        address nftAddress;
    }

    struct AssetPoolInfo {
        address assetPoolAddress;
        address bondNftAddress;
        uint256 bondvalue;
    }

    mapping(address => BondConfig[]) public userBondConfigs;
    mapping(address => AssetPoolInfo[]) public userAssetPools;

    address[] public allBondNfts;
    address[] public allAssetPools;
    
    event BondNFTCreated(
        address issuerAddress,
        address bondNftAddress,
        string name,
        string symbol
    );

    event BondNFTMinted(
        address indexed bondNftAddress,
        uint256 numberOfBonds
    );

    event AssetPoolCreated(
        address artist,
        address assetPool,
        uint256 bondValue
    );

    struct ListenersDetails {
        uint256 spotifyStreamCount;
        uint256 youtubeViewsCount;
        address assetPoolAddress;
    }

    event BondGenerated(address nftaddress, uint256);
    event BondInitialized(address nftaddress, uint256);
    event BondConfigDone(address nftaddress, uint256);
    event BondAssestPoolInfoGet(address nftaddress, uint256);

    modifier onlyOwnerOrManager() {
        require((owner() == msg.sender) || (manager == msg.sender), "Caller needs to Owner or Manager");
        _;
    }

    function initialize(address _ratingEngine, address _bondNftGenerator, address _usdcAddress, address _managerAddress) public onlyOwner {
        ratingEngine = RatingEngine(_ratingEngine);
        bondNFTGenerator = BondNFTGenerator(_bondNftGenerator);
        usdcAddress = _usdcAddress;
        manager = _managerAddress;
    }

    function createAssetPool(uint256 _bondValue) public returns(address assetPoolAddress) {
        require(_bondValue > 0, "Value of the bond cannot be 0");
        AssetPool assetPool = new AssetPool(usdcAddress,manager);
        assetPoolAddress = address(assetPool);
        assetPool.initialize(msg.sender, _bondValue);
        userAssetPools[msg.sender].push(AssetPoolInfo(assetPoolAddress,address(0),_bondValue));
        allAssetPools.push(assetPoolAddress);
        emit AssetPoolCreated(msg.sender, assetPoolAddress, _bondValue);
    }

    function issueBond(string memory _artistName, string memory _youtubeSongId, string memory _soundchartsSongId, string memory _songstatsSongId,
                        uint256 _fundingAmount, uint256 _numberOfYears, uint256 _numberOfBonds, 
                        uint256 _facevalue, string memory _bondName, string memory _bondSymbol, 
                        ListenersDetails memory listenersDetails) public returns(address nftAddress) {
       
        nftAddress = bondNFTGenerator.generateNFT(_bondName, _bondSymbol);
        
        emit BondGenerated(nftAddress,1);
        
        BondNFT bondNFT = BondNFT(nftAddress);
        /*
        bondNFT.initialize(_artistName, _youtubeArtistId, _soundchartsSpotifyArtistId, _songstatsSpotifyArtistId, _fundingAmount, _numberOfYears, 
                            _numberOfBonds, _facevalue, listenersDetails.spotifyListeners, 
                            listenersDetails.youtubeSubscribers, listenersDetails.assetPoolAddress);
        */
        bondNFT.initialize(_artistName, _youtubeSongId, _soundchartsSongId, _songstatsSongId, _fundingAmount, _numberOfYears, 
                            _numberOfBonds, _facevalue, listenersDetails.spotifyStreamCount, 
                            listenersDetails.youtubeViewsCount, listenersDetails.assetPoolAddress);
        emit BondInitialized(nftAddress,2);
        
        /*
        BondConfig memory _config = BondConfig(_artistName,_youtubeArtistId,_soundchartsSpotifyArtistId, _songstatsSpotifyArtistId, _fundingAmount, 
                                    _numberOfYears, _numberOfBonds, msg.sender,_facevalue,0,nftAddress);
        */
        
        BondConfig memory _config = BondConfig(_artistName,_youtubeSongId,_soundchartsSongId, _songstatsSongId, _fundingAmount, 
            _numberOfYears, _numberOfBonds, msg.sender,_facevalue,0,nftAddress);
        
        userBondConfigs[msg.sender].push(_config);
        allBondNfts.push(nftAddress);
        emit BondConfigDone(nftAddress,3);
        AssetPoolInfo memory assetPoolInfo = getAssetPoolInfo(msg.sender,listenersDetails.assetPoolAddress);
        assetPoolInfo.bondNftAddress = nftAddress;
        emit BondAssestPoolInfoGet(nftAddress,4);
        AssetPool assetPool = AssetPool(payable(listenersDetails.assetPoolAddress));
        assetPool.initializeBondInfo(_numberOfYears, nftAddress);
        
        emit BondNFTCreated(msg.sender,nftAddress,_bondName,_bondSymbol);
        
    }

    function getAssetPoolInfo(address _artist, address _assetPoolAddress) private view returns(AssetPoolInfo memory) {
        AssetPoolInfo[] memory list = userAssetPools[_artist];
        for(uint32 i=0;i<list.length;i++ ) {
            if(list[i].assetPoolAddress == _assetPoolAddress) {
                return list[i];
            }
        }
        require(false, "Asset Pool Not Found");
    }

    //onlyOwnerOrManager
    function mintNFTBond(address _nftAddress) public {
        BondNFT bondNFT = BondNFT(_nftAddress);
        bondNFT.mintBonds(msg.sender);
        emit BondNFTMinted(_nftAddress,bondNFT.totalSupply());
    }

    function allAssetPoolsLength() external view returns (uint256) {
        return allAssetPools.length;
    }

    function allNftLength() external view returns (uint256) {
        return allBondNfts.length;
    }

    function assetPoolsLengthForUser(address _creatorAddress) external view returns (uint256) {
        return userAssetPools[_creatorAddress].length;
    }

    function nftBondLengthForUser(address _creatorAddress) external view returns (uint256) {
        return userBondConfigs[_creatorAddress].length;
    }

    function setManager(address _manager) public onlyOwner {
        manager = _manager;
    }
}