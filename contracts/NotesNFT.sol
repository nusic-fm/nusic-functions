// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "operator-filter-registry/src/DefaultOperatorFilterer.sol";
import {ERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";
///import "./FunctionsConsumer.sol";
//import "./ChainlinkSpotifyListeners.sol";
//import "./ChainlinkMetadataRequest.sol";
//import "./ChainlinkYoutubeSubscribers.sol";

contract NotesNFT is ERC721, Ownable, DefaultOperatorFilterer, ERC2981{
    using Strings for string;
    using Strings for uint256;

    uint256 public totalSupply;

    string public artistName;
    string public youtubeSongId;
    string public soundchartsSongId;
    string public songstatsSongId;
    string public chartmetricSongId;
    uint256 public numberOfTokens; // Same as Max Supply
    address public issuerAddress;
    uint256 public spotifyStreamCount;
    uint256 public youtubeViewsCount;
    uint256 public price;

    address public promotionOne;
    address public promotionTwo;
    uint256 public promotionOneShare;
    uint256 public promotionTwoShare;
    uint256 public promotionOneBalance;
    uint256 public promotionTwoBalance;

    string public defaultURI = "https://gateway.pinata.cloud/ipfs/QmPWLgwGkKYy8skLM6YH4PSTFYekkH6W4M9TjRmsoGdMkm";
    string public baseURI;

    address public manager;
    ERC20 public USDC;

    event NotesNFTInitialized(string _artistName, address _artistAddress, uint256 _price, uint256 _numberOfTokens);
    event NotesNFTMinted(address _to, uint256 _tokenId, uint256 _price);
    event PromotionWithdrawl(address influencer, uint256 amount);

    modifier onlyOwnerManagerOrArtist() {
        require((owner() == msg.sender) || (manager == msg.sender)  || (issuerAddress == msg.sender), "Caller needs to Owner or Manager or Artist");
        _;
    }

    modifier onlyOwnerOrManager() {
        require((owner() == msg.sender) || (manager == msg.sender), "Caller needs to Owner or Manager");
        _;
    }

    constructor(string memory _name, string memory _symbol, address _usdcAddress, address _manager) ERC721(_name, _symbol) {
        USDC = ERC20(_usdcAddress);
        manager = _manager;
    }

    // funding amount means amount issuer will deposit at start
    
    function initialize(string memory _artistName, address _artistAddress, string memory _youtubeSongId, string memory _soundchartsSongId, string memory _songstatsSongId, string memory _chartmetricSongId,
                uint256 _price, uint256 _numberOfTokens, uint256 _spotifyStreamCount, uint256 _youtubeViewsCount) public {

        artistName = _artistName;
        youtubeSongId = _youtubeSongId;
        soundchartsSongId = _soundchartsSongId;
        songstatsSongId = _songstatsSongId;
        chartmetricSongId = _chartmetricSongId;
        numberOfTokens = _numberOfTokens;
        issuerAddress = _artistAddress;
        price = _price;
        spotifyStreamCount = _spotifyStreamCount;
        youtubeViewsCount = _youtubeViewsCount;

        emit NotesNFTInitialized(_artistName, _artistAddress, _price, _numberOfTokens);
    }

    function setupPromotions(address _promotionOne, uint256 _promotionOneShare, address _promotionTwo, uint256 _promotionTwoShare) public {
        promotionOne = _promotionOne;
        promotionTwo = _promotionTwo;
        promotionOneShare = _promotionOneShare;
        promotionTwoShare = _promotionTwoShare;
    }

    function mintBonds(address to, uint256 _amount) public {
        uint256 allowance = USDC.allowance(to, address(this));
        require(allowance >= (_amount),"Insufficient approval for funds");
        require((price * numberOfTokens) == _amount, "Insufficient Funds Sent" );
        USDC.transferFrom(to, address(this), _amount);

        for(uint16 i=0; i<numberOfTokens; i++) {
            _safeMint(to, totalSupply);
            emit NotesNFTMinted(to, totalSupply, price);
            totalSupply++;
        }

        promotionOneBalance += _amount * promotionOneShare / 10000;
        promotionTwoBalance += _amount * promotionTwoShare / 10000;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function setBaseURI(string memory uri) public onlyOwnerOrManager {
        baseURI = uri;
    }

        function setDefaultURI(string memory _defaultURI) public onlyOwner {
		defaultURI = _defaultURI;
	}

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "Token does not exists");
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString(),".json")) : defaultURI;
    }

    // For Spotify Listeners Request FulFill
    function latestSpotifyStreamCountFulFill(uint256 _spotifyStreamCount) public {
        spotifyStreamCount = _spotifyStreamCount;
    }

    function latestYoutubeViewsCountFulFill(uint256 _youtubeViewsCount) public {
        youtubeViewsCount = _youtubeViewsCount;
    }

    function withdraw() public onlyOwnerOrManager{
        require(issuerAddress != address(0),"NULL Address Provided");
        USDC.transfer(issuerAddress, USDC.balanceOf(address(this)));
    }

    function setManager(address _manager) public onlyOwnerOrManager {
        manager = _manager;
    }

    function withdrawForPromotionOne() public onlyOwnerManagerOrArtist {
        require(promotionOne != address(0) && promotionOneShare != 0,"Invalid details for Promotion One");
        require(promotionOneBalance != 0,"No balance available for PromotionOne");
        USDC.transfer(promotionOne, promotionOneBalance);
        emit PromotionWithdrawl(promotionOne, promotionOneBalance);
        promotionOneBalance = 0;
    }

    function withdrawForPromotionTwo() public onlyOwnerManagerOrArtist {
        require(promotionTwo != address(0) && promotionTwoShare != 0,"Invalid details for Promotionr Two");
        require(promotionTwoBalance != 0,"No balance available for PromotionTwo");
        USDC.transfer(promotionTwo, promotionTwoBalance);
        emit PromotionWithdrawl(promotionTwo, promotionTwoBalance);
        promotionTwoBalance = 0;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC2981) returns (bool) {
        // Supports the following `interfaceId`s:
        // - IERC165: 0x01ffc9a7
        // - IERC721: 0x80ac58cd
        // - IERC721Metadata: 0x5b5e139f
        // - IERC2981: 0x2a55205a
        return
            ERC721.supportsInterface(interfaceId) ||
            ERC2981.supportsInterface(interfaceId);
    }
    

}
