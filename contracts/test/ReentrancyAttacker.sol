// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

interface IPrivacyPool {
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

contract ReentrancyAttacker {
    /*
        When the contract transfers the ETH to this contract, it tries to reenter the withdraw function.
        Realistically, the gas cost of processing the zkproof in the withdrawal function is much greater
        than the amount of gas forwarded during an ETH transfer, so this would fail regardless, but we
        can test the ReentrancyGuard contract because the revert condition will be checked immediately,
        before the gas is expended in the logic of the function.
    */
    fallback() external payable {
        IPrivacyPool(msg.sender).withdraw(
            [uint256(0), 0, 0, 0, 0, 0, 0, 0],
            0,
            0,
            0,
            address(0),
            address(0),
            0
        );
    }
}
