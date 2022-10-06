// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract AccessListNFT is ERC721, Ownable {

    // emit the treeType subsetRoot when NFT is minted
    event MintEvent(
        uint indexed subsetRoot,
        TreeType treeType
    );

    /**
        @dev: the zeroth byte is Invalid because we want to avoid preferring either tree type as a default.
     */
    enum TreeType {
        Invalid, Allowlist, Blocklist
    }

    struct SubsetMetadata {
        TreeType treeType;
        uint248 blockNumber;
    }

    uint256 public s_tokenId;
    mapping (uint => SubsetMetadata) public s_subsetRootTosubsetMetadata; // mapping from subset root -> subset meta data

    constructor(
        uint subsetRoot,
        string memory treeType,
        bytes memory subsetString
    ) ERC721("ACCESS_LIST", "AXL"){}

    /**
        @dev mint NFT. Notice:
        * token id of the NFT = subsetRoot
        * subsetString is included in calldata so that later we can parse transaction receipts to retrieve the data
    */
    function mintNft(
        uint _subsetRoot,
        TreeType _treeType,
        bytes memory _subsetString
    ) 
        public 
        onlyOwner
        returns(uint256)
    {
        s_tokenId = _subsetRoot;
        s_subsetRootTosubsetMetadata[s_tokenId] = SubsetMetadata({treeType: _treeType, blockNumber: uint248(block.number)});
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
    ) public pure override returns(string memory){
        return string(
            abi.encodePacked(
                "https://ipfs.io/ipfs/xxxxxxx/",
                Strings.toString(_tokenId),
                ".json"
            )
        );
    }
}