// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./IncrementalMerkleTree.sol";
import "./verifiers/withdraw_from_subset_simple_verifier.sol";

error PrivacyTokenPool__FeeExceedsAmount();
error PrivacyTokenPool__InvalidZKProof();
error PrivacyTokenPool__MsgValueInvalid();
error PrivacyTokenPool__NoteAlreadySpent();
error PrivacyTokenPool__UnknownRoot();
error PrivacyTokenPool__ZeroAddress();

// No tokens pool. The pool accepts only one denomination of ETH. (E.g. 1 ETH pool, 0.1 ETH pool, 10 ETH pool, etc.)
contract PrivacyPool is
    ReentrancyGuard,
    IncrementalMerkleTree,
    WithdrawFromSubsetSimpleVerifier
{
    using ProofLib for bytes;

    // the same commitment can be deposited multiple times, can search for which leafIndexes it has in the tree
    event Deposit(
        uint256 indexed commitment,
        uint256 denomination,
        uint256 leafIndex,
        uint256 timestamp
    );
    // relayer, subsetRoot, and nullifier are indexed but recipient is always expected to be a new address
    event Withdrawal(
        address recipient,
        address indexed relayer,
        uint256 indexed subsetRoot,
        uint256 indexed nullifier,
        uint256 fee
    );

    // denomination of deposits and withdrawals for this pool
    uint256 public immutable denomination;
    // double spend records
    mapping(uint256 => bool) public nullifiers;

    constructor(address poseidon, uint256 _denomination) IncrementalMerkleTree(poseidon) {
        denomination = _denomination;
    }

    /*
        Deposit `denomination` amount of ETH.
    */
    function deposit(uint256 commitment) public payable nonReentrant returns (uint256) {
        if (msg.value != denomination) revert PrivacyTokenPool__MsgValueInvalid();
        uint256 leafIndex = insert(commitment);
        emit Deposit(
            commitment,
            denomination,
            leafIndex,
            block.timestamp
        );
        return leafIndex;
    }

    /*
        Withdraw using zkProof.
    */
    function withdraw(
        uint256[8] calldata flatProof,
        uint256 root,
        uint256 subsetRoot,
        uint256 nullifier,
        address recipient,
        address relayer,
        uint256 fee
    ) public nonReentrant returns (bool) {
        if (nullifiers[nullifier]) revert PrivacyTokenPool__NoteAlreadySpent();
        if (!isKnownRoot(root)) revert PrivacyTokenPool__UnknownRoot();
        if (fee > denomination) revert PrivacyTokenPool__FeeExceedsAmount();
        if (recipient == address(0) || relayer == address(0)) revert PrivacyTokenPool__ZeroAddress();
        uint256 message = abi
            .encodePacked(recipient, relayer, fee)
            .snarkHash();
        if (
            !_verifyWithdrawFromSubsetSimpleProof(
                flatProof,
                root,
                subsetRoot,
                nullifier,
                message
            )
        ) revert PrivacyTokenPool__InvalidZKProof();

        nullifiers[nullifier] = true;
        emit Withdrawal(recipient, relayer, subsetRoot, nullifier, fee);

        if (fee > 0) {
            unchecked {
                payable(recipient).transfer(denomination - fee);
            }
            payable(relayer).transfer(fee);
        } else {
            payable(recipient).transfer(denomination);
        }
        return true;
    }
}
