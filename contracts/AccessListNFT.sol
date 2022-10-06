// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract AccessListNFT is ERC721, Ownable {

    // emit the treeType subsetRoot when NFT is minted
    event MintEvent(
        uint subsetRoot,
        string treeType
    );

    struct MetaData{
        uint blockNumber;
        string treeType;
    }

    // string public constant TOKEN_URI = 'https://ipfs.io/ipfs/<>';   //stores block.number of the event - to be used for reconstructing the access list.
    uint256 private s_tokenId;
    mapping(uint => uint) private s_tokenIdToBlockNumber; // mapping from subset root -> block number
    mapping(uint => string) private s_tokenIdToTreeType; // mapping from subset root -> tree type

    constructor(
        uint subsetRoot,
        string memory treeType,
        bytes memory subsetString
    ) ERC721("ACCESS_LIST", "AXL"){}

    /**
        @dev mint NFT. token id of the NFT = subsetRoot
    */
    function mintNft(
        uint _subsetRoot,
        string calldata _treeType
    ) 
        public 
        onlyOwner
        returns(uint256)
    {
        s_tokenId = _subsetRoot;
        s_tokenIdToBlockNumber[s_tokenId] = block.number;
        s_tokenIdToTreeType[s_tokenId] = _treeType;
        emit MintEvent(s_tokenId, _treeType);
        _safeMint(msg.sender, _subsetRoot);
        return s_tokenId;
    }

    function getTokenId() public view returns(uint256){
        return s_tokenId;
    }

    /**
        @dev return json blob with:
            - block number 
            - tree type
     */
    function tokenURI(
        uint256 _tokenId
    ) public view override returns(string memory){
        uint _blockNumber = s_tokenIdToBlockNumber[_tokenId];
        string memory _treeType = s_tokenIdToTreeType[_tokenId];

        return string(
            abi.encodePacked(
                "{\"blockNumber\":",
                Strings.toString(_blockNumber),
                ",\"treeType\":",
                "\"",
                _treeType,
                "\"",
                "}"
            )
        );
    }
}