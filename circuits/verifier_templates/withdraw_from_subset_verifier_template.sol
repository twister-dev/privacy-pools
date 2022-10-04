// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./ProofLib.sol";

contract WithdrawFromSubsetVerifier {
    using ProofLib for ProofLib.G1Point;
    using ProofLib for ProofLib.G2Point;

    function withdrawFromSubsetVerifyingKey()
        internal
        pure
        returns (ProofLib.VerifyingKey memory vk)
    {
// VERIFYING KEY
    }

    function _verifyWithdrawFromSubsetProof(
        uint256[8] calldata flatProof,
        uint256 root,
        uint256 subsetRoot,
        uint256 nullifier,
        uint256 assetMetadata,
        uint256 withdrawMetadata
    ) internal view returns (bool) {
        if (
            root >= ProofLib.snark_scalar_field ||
            subsetRoot >= ProofLib.snark_scalar_field ||
            nullifier >= ProofLib.snark_scalar_field ||
            assetMetadata >= ProofLib.snark_scalar_field ||
            withdrawMetadata >= ProofLib.snark_scalar_field
        ) revert ProofLib.GteSnarkScalarField();

        ProofLib.Proof memory proof;
        proof.A = ProofLib.G1Point(flatProof[0], flatProof[1]);
        proof.B = ProofLib.G2Point(
            [flatProof[2], flatProof[3]],
            [flatProof[4], flatProof[5]]
        );
        proof.C = ProofLib.G1Point(flatProof[6], flatProof[7]);

        ProofLib.VerifyingKey memory vk = withdrawFromSubsetVerifyingKey();
        ProofLib.G1Point memory vk_x = ProofLib.G1Point(0, 0);
        vk_x = vk_x.addition(vk.IC[1].scalarMul(root));
        vk_x = vk_x.addition(vk.IC[2].scalarMul(subsetRoot));
        vk_x = vk_x.addition(vk.IC[3].scalarMul(nullifier));
        vk_x = vk_x.addition(vk.IC[4].scalarMul(assetMetadata));
        vk_x = vk_x.addition(vk.IC[5].scalarMul(withdrawMetadata));
        vk_x = vk_x.addition(vk.IC[0]);
        return
            proof.A.negate().pairingProd4(
                proof.B,
                vk.alfa1,
                vk.beta2,
                vk_x,
                vk.gamma2,
                proof.C,
                vk.delta2
            );
    }
}
