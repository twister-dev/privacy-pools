// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "hardhat/console.sol";

contract FilledSubtreesFinder {
    function getFilledSubtreeIndex(uint256 elementIndex, uint256 layerIndex)
        public
        pure
        returns (uint256 filledSubtreeIndex)
    {
        unchecked {
            filledSubtreeIndex = 2 * (elementIndex / (1 << (layerIndex + 1)));
        }
    }

    function getFilledSubtreeIndexGasEstimate(
        uint256 elementIndex,
        uint256 layerIndex
    ) public returns (uint256 filledSubtreeIndex) {
        unchecked {
            filledSubtreeIndex = 2 * (elementIndex / (1 << (layerIndex + 1)));
        }
    }
}
