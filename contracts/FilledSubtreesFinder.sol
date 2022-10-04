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

    // this is a cheap hack to get the hardhat-gas-reporter plugin to estimate
    // the gas of this function during the unit test
    function getFilledSubtreeIndexGasEstimate(
        uint256 elementIndex,
        uint256 layerIndex
    ) public payable returns (uint256 filledSubtreeIndex) {
        unchecked {
            filledSubtreeIndex = 2 * (elementIndex / (1 << (layerIndex + 1)));
        }
    }
}
