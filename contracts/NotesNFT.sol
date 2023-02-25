// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
///import "./FunctionsConsumer.sol";
//import "./ChainlinkSpotifyListeners.sol";
//import "./ChainlinkMetadataRequest.sol";
//import "./ChainlinkYoutubeSubscribers.sol";

contract NotesNFT is ERC721, Ownable {
    using Strings for string;
    using Strings for uint256;

    uint256 public totalSupply;

    string public artistName;
    string public youtubeSongId;
    string public soundchartsSongId;
    string public songstatsSongId;
    uint256 public numberOfTokens; // Same as Max Supply
    address public issuerAddress;
    uint256 public spotifyStreamCount;
    uint256 public youtubeViewsCount;
    uint256 public price;

    // URI to be used before Reveal
    string public defaultURI = "ipfs://QmUNYMorLY9y15eYYZDXxTbdQPAXWqC3MwMm4Jtuz7SsxA";
    string public baseURI;

    address public manager;

    event NotesNFTInitialized(string _artistName, address _artistAddress, uint256 _price, uint256 _numberOfTokens);
    event NotesNFTMinted(address _to, uint256 _tokenId, uint256 _price);

    modifier onlyOwnerManagerOrArtist() {
        require((owner() == msg.sender) || (manager == msg.sender)  || (issuerAddress == msg.sender), "Caller needs to Owner or Manager or Artist");
        _;
    }

    modifier onlyOwnerOrManager() {
        require((owner() == msg.sender) || (manager == msg.sender), "Caller needs to Owner or Manager");
        _;
    }

    constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {
    }

    // funding amount means amount issuer will deposit at start
    
    function initialize(string memory _artistName, address _artistAddress, string memory _youtubeSongId, string memory _soundchartsSongId, string memory _songstatsSongId,
                uint256 _price, uint256 _numberOfTokens, uint256 _spotifyStreamCount, uint256 _youtubeViewsCount, address _manager) public {
        artistName = _artistName;
        youtubeSongId = _youtubeSongId;
        soundchartsSongId = _soundchartsSongId;
        songstatsSongId = _songstatsSongId;
        numberOfTokens = _numberOfTokens;
        issuerAddress = _artistAddress;
        price = _price;
        spotifyStreamCount = _spotifyStreamCount;
        youtubeViewsCount = _youtubeViewsCount;
        manager = _manager;

        emit NotesNFTInitialized(_artistName, _artistAddress, _price, _numberOfTokens);
    }
    function mintBonds(address to) public payable {
        require((price * numberOfTokens) == msg.value, "Insufficient Funds Sent" );
        for(uint16 i=0; i<numberOfTokens; i++) {
            _safeMint(to, totalSupply);
            emit NotesNFTMinted(to, totalSupply, price);
            totalSupply++;
        }
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function setBaseURI(string memory uri) public onlyOwnerOrManager {
        baseURI = uri;
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

    function withdraw() public onlyOwnerOrManager {
        require(manager != address(0),"NULL Address Provided");
        (bool sent, ) = manager.call{value: address(this).balance}("");
        require(sent, "Failed to withdraw Ether");
    }

    function setManager(address _manager) public onlyOwnerOrManager {
        manager = _manager;
    }

}
