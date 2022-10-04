// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


contract AccessListNFT is ERC721 {

    // emit the treeType, subsetRoot, and subsetString when NFT is minted
    event Mint(
        uint subsetRoot,
        string treeType,
        string subsetString
    );

    string public constant TOKEN_URI = 'https://ipfs.io/ipfs/<>';   //stores block.number of the event - to be used for reconstructing the access list.
    uint256 private s_tokenId;


    constructor(
        uint subsetRoot,
        string memory treeType,
        string memory subsetString
    ) ERC721("ACCESS_LIST", "AXL"){}

    /**
        @dev mint NFT. token id of the NFT = subsetRoot
    */
    function mintNft(
        uint subsetRoot,
        string calldata treeType,
        string calldata subsetString
    ) 
        public 
        returns(uint256)
    {
        s_tokenId = subsetRoot;
        emit Mint(s_tokenId, treeType, subsetString);
        _safeMint(msg.sender, s_tokenId);
        return s_tokenId;
    }

    function getTokenId() public view returns(uint256){
        return s_tokenId;
    }

    function tokenURI(
        uint256 /*tokenId*/
    ) public pure override returns(string memory){
        return TOKEN_URI;
    }

    //TODO: integrate createSubsetFromFilter
}