// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

interface Poseidon {
    function poseidon(uint256[2] calldata) external pure returns (uint256);
}