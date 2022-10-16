// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

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

    mapping (uint => SubsetMetadata) public s_subsetRootTosubsetMetadata; // mapping from subset root -> subset meta data
    uint256 public s_subsetRoot;
    TreeType public s_treeType;
    bytes public s_subsetString;

    constructor(
        uint _subsetRoot,
        TreeType _treeType,
        bytes memory _subsetString
    ) ERC721("ACCESS_LIST", "AXL"){
        s_subsetRoot = _subsetRoot;
        s_treeType = _treeType;
        s_subsetString = _subsetString;
    }

    /**
        @dev mint NFT. Notice:
        * token id of the NFT = subsetRoot
        * subsetString is included in calldata so that later we can parse transaction receipts to retrieve the data
    */
    function mintNft() 
        public 
        onlyOwner
        returns(uint256)
    {
        s_subsetRootTosubsetMetadata[s_subsetRoot] = SubsetMetadata({treeType: s_treeType, blockNumber: uint248(block.number)});
        emit MintEvent(s_subsetRoot, s_treeType);
        _safeMint(msg.sender, s_subsetRoot);
        return s_subsetRoot;
    }

    function getTokenId() public view returns(uint256){
        return s_subsetRoot;
    }

    /**
        @dev return json blob with:
            - block number 
            - tree type
     */
    function tokenURI(
        uint256 /*_tokenId*/
    ) public view override returns(string memory){
        return string(
            abi.encodePacked(
                "https://ipfs.io/ipfs/xxxxxxx/",
                Strings.toString(s_subsetRoot),
                ".json"
            )
        );
    }
}