// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "hardhat/console.sol";

contract FilledSubtreesFinder {
    function getFilledSubtreeIndex(uint elementIndex, uint layerIndex)
        public
        pure
        returns (uint filledSubtreeIndex)
    {
        unchecked {
            filledSubtreeIndex = 2 * ( elementIndex / (1 << (layerIndex + 1)));
        }
    }

    function asdf(uint e, uint l) public {
        getFilledSubtreeIndex(e, l);
    }
}