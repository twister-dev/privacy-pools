// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./IncrementalMerkleTree.sol";
import "./verifiers/withdraw_from_subset_verifier.sol";

contract PrivacyTokenPool is
    ReentrancyGuard,
    IncrementalMerkleTree,
    WithdrawFromSubsetVerifier
{
    using ProofLib for bytes;
    using SafeERC20 for IERC20;

    // emit the raw commitment, stamped leaf, plus the data to reconstruct the stamped commitment
    event Deposit(
        uint256 indexed commitment,
        uint256 indexed leaf,
        address indexed token,
        uint256 amount,
        uint256 leafIndex,
        uint256 timestamp
    );
    // emit the subsetRoot with each withdrawal
    event Withdrawal(
        address recipient,
        address indexed relayer,
        uint256 indexed subsetRoot,
        uint256 nullifier,
        uint256 fee
    );

    // prevent overflow for fee value
    error FeeExceedsAmount();
    // require zk proof to be valid
    error InvalidZKProof();
    // check against the value submitted in calldata
    error MsgValueInvalid();
    // prevent the double spend
    error NoteAlreadySpent();
    // invalid or stale root
    error UnknownRoot();

    // double spend records
    mapping(uint256 => bool) public nullifiers;

    constructor(address poseidon) IncrementalMerkleTree(poseidon) {}

    /*
        Deposit any asset and any amount.
    */
    function deposit(
        uint256 commitment,
        address token,
        uint256 amount
    ) public payable nonReentrant returns (uint256) {
        if (token == 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE) {
            if (msg.value != amount) revert MsgValueInvalid();
        } else {
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        }
        uint256 assetMetadata = abi.encodePacked(token, amount).snarkHash();
        uint256 leaf = hasher.poseidon([commitment, assetMetadata]);
        uint256 leafIndex = insert(leaf);
        emit Deposit(
            commitment,
            leaf,
            token,
            amount,
            leafIndex,
            block.timestamp
        );
        return leafIndex;
    }

    /*
        Withdraw using zkProof.
    */
    function withdrawFromSubset(
        uint256[8] calldata flatProof,
        uint256 root,
        uint256 subsetRoot,
        uint256 nullifier,
        address token,
        uint256 amount,
        address recipient,
        uint256 refund,
        address relayer,
        uint256 fee
    ) public payable nonReentrant returns (bool) {
        if (nullifiers[nullifier]) revert NoteAlreadySpent();
        if (!isKnownRoot(root)) revert UnknownRoot();
        if (fee > amount) revert FeeExceedsAmount();
        uint256 assetMetadata = abi.encodePacked(token, amount).snarkHash();
        uint256 withdrawMetadata = abi
            .encodePacked(recipient, refund, relayer, fee)
            .snarkHash();
        if (
            !_verifyWithdrawFromSubsetProof(
                flatProof,
                root,
                subsetRoot,
                nullifier,
                assetMetadata,
                withdrawMetadata
            )
        ) revert InvalidZKProof();

        nullifiers[nullifier] = true;

        if (token == 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE) {
            if (msg.value != 0) revert MsgValueInvalid();
            if (fee > 0) {
                unchecked {
                    payable(recipient).transfer(amount - fee);
                }
                payable(relayer).transfer(fee);
            } else {
                payable(recipient).transfer(amount);
            }
        } else {
            if (msg.value != refund) revert MsgValueInvalid();
            if (refund > 0) {
                payable(recipient).transfer(refund);
            }
            if (fee > 0) {
                IERC20(token).safeTransfer(recipient, amount - fee);
                IERC20(token).safeTransfer(relayer, fee);
            } else {
                IERC20(token).safeTransfer(recipient, amount);
            }
        }
        emit Withdrawal(recipient, relayer, subsetRoot, nullifier, fee);

        return true;
    }
}
