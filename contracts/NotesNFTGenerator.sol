// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./NotesNFT.sol";

contract NotesNFTGenerator is Ownable {
    
    function generateNFT(string memory _notesName, string memory _notesSymbol) public returns(address) {
        NotesNFT nft = new NotesNFT(_notesName, _notesSymbol);
        return address(nft);
    }
}
