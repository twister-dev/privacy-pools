// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

interface IPrivacyPool {
    function deposit(uint256) external returns (uint256);

    function withdraw(
        uint256[8] calldata flatProof,
        uint256 root,
        uint256 subsetRoot,
        uint256 nullifier,
        address recipient,
        address relayer,
        uint256 fee
    ) external returns (bool);
}
