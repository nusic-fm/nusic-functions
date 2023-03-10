// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./RatingEngine.sol";
import "./NotesNFTGenerator.sol";
import "./NotesNFT.sol";
import "./AssetPool.sol";
import "hardhat/console.sol";


contract NotesNFTManager is Ownable {

    using Strings for string;

    RatingEngine private ratingEngine;
    NotesNFTGenerator private notesNFTGenerator;

    address usdcAddress;
    address manager;

    struct BondConfig {
        string artistName;
        address issuerAddress;
        address nftAddress;
    }

    struct AssetPoolInfo {
        address assetPoolAddress;
        address bondNftAddress;
        uint256 bondvalue;
    }

    mapping(address => address[]) public userBondConfigs;
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
    }

    struct PromotionDetails {
        address promotionOne;
        address promotionTwo;
        uint256 promotionOneShare;
        uint256 promotionTwoShare;
    }

    event BondGenerated(address nftaddress, uint256);
    event BondInitialized(address nftaddress, uint256);
    event BondConfigDone(address nftaddress, uint256);
    event BondAssestPoolInfoGet(address nftaddress, uint256);

    modifier onlyOwnerOrManager() {
        require((owner() == msg.sender) || (manager == msg.sender), "Caller needs to Owner or Manager");
        _;
    }

    function initialize(address _ratingEngine, address _notesNftGenerator, address _usdcAddress, address _managerAddress) public onlyOwner {
        ratingEngine = RatingEngine(_ratingEngine);
        notesNFTGenerator = NotesNFTGenerator(_notesNftGenerator);
        usdcAddress = _usdcAddress;
        manager = _managerAddress;
    }

    function issueNotes(string memory _artistName, address _artistAddress, string memory _youtubeSongId, string memory _soundchartsSongId, string memory _songstatsSongId, string memory _chartmetricSongId,
                        uint256 _price, uint256 _numberOfTokens, string memory _notesName, string memory _notesSymbol, 
                        ListenersDetails memory listenersDetails, PromotionDetails memory promotionDetails) public {
       
        //nftAddress = bondNFTGenerator.generateNFT(_notesName, _notesSymbol);
        NotesNFT nft = new NotesNFT(_notesName, _notesSymbol, usdcAddress, manager);
        address nftAddress = address(nft);
        
        emit BondGenerated(nftAddress,1);
        
        //BondNFT bondNFT = BondNFT(nftAddress);

        nft.initialize(_artistName, _artistAddress, _youtubeSongId, _soundchartsSongId, _songstatsSongId, _chartmetricSongId,_price,_numberOfTokens, listenersDetails.spotifyStreamCount, 
                            listenersDetails.youtubeViewsCount);
        nft.setupPromotions(promotionDetails.promotionOne, promotionDetails.promotionOneShare, promotionDetails.promotionTwo, promotionDetails.promotionTwoShare);
        emit BondInitialized(nftAddress,2);
        
        //BondConfig memory _config = BondConfig(_artistName, _artistAddress,nftAddress);
        
        userBondConfigs[msg.sender].push(nftAddress);
        allBondNfts.push(nftAddress);
        emit BondConfigDone(nftAddress,3);
        
        emit BondNFTCreated(msg.sender,nftAddress,_notesName, _notesSymbol);
        
    }

    //onlyOwnerOrManager
    function mintNFTNotes(address _nftAddress, uint256 _amount) public {
        NotesNFT notesNFT = NotesNFT(_nftAddress);
        notesNFT.mintBonds(msg.sender, _amount);
        emit BondNFTMinted(_nftAddress,notesNFT.totalSupply());
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