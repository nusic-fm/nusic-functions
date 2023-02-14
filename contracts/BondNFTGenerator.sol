// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./BondNFT.sol";

contract BondNFTGenerator is Ownable {

    /*
    function generateNFT(string memory _bondName, string memory _bondSymbol, address _functionConsumerAddress) public returns(address) {
        BondNFT nft = new BondNFT(_bondName, _bondSymbol, _functionConsumerAddress);
        return address(nft);
    }
    */
    
    function generateNFT(string memory _bondName, string memory _bondSymbol) public returns(address) {
        BondNFT nft = new BondNFT(_bondName, _bondSymbol);
        return address(nft);
    }
}
