// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AccessListNFT is ERC721, Ownable {

    // emit the treeType subsetRoot when NFT is minted
    event Mint(
        uint subsetRoot,
        string treeType
    );

    string public constant TOKEN_URI = 'https://ipfs.io/ipfs/<>';   //stores block.number of the event - to be used for reconstructing the access list.
    uint256 private s_tokenId;


    constructor(
        uint subsetRoot,
        string memory treeType,
        bytes memory subsetString
    ) ERC721("ACCESS_LIST", "AXL"){}

    /**
        @dev mint NFT. token id of the NFT = subsetRoot
    */
    function mintNft(
        uint subsetRoot,
        string calldata treeType
    ) 
        public 
        onlyOwner
        returns(uint256)
    {
        s_tokenId = subsetRoot;
        emit Mint(s_tokenId, treeType);
        _safeMint(msg.sender, s_tokenId);
        return s_tokenId;
    }

    function getTokenId() public view returns(uint256){
        return s_tokenId;
    }

    /**
        return json blob: 
            - block number (mapping at the time of mint)
            - tree type

    
     */
    function tokenURI(
        uint256 /*tokenId*/
    ) public pure override returns(string memory){
        return TOKEN_URI;
    }
}