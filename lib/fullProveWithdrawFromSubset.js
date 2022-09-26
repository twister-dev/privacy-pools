const calculateNextRoot = require('./calculateNextRoot');
const generateProof = require('./generateProof');
const { poseidon: hasher } = require('./poseidon');
const { MerkleTree } = require('./merkleTree');

const { hashMod, flattenProof, toProofInput } = require('./utils');

module.exports = async function fullProveWithdrawFromSubset({
    zkeyFileName,
    wasmFileName,
    commitments,
    subsetRoot,
    subsetString,
    token, denomination,
    recipient, refund, relayer, fee,
    secret,
    path,
}) {
    try {
        const assetMetadata = hashMod(['address', 'uint'], [token, denomination]);
        const withdrawMetadata = hashMod(
            ['address', 'uint', 'address', 'uint'], [recipient, refund, relayer, fee]
        );

        const { root: newRoot, filledSubtrees: endSubtrees } = calculateNextRoot({
            baseString,
            hasher,
            startIndex,
            startSubtrees,
            leaves,
        });
        const { proof, publicSignals } = await generateProof({
            input: toProofInput({
                newRoot,
                startIndex,
                startSubtrees,
                endSubtrees,
                leaves
            }),
            zkeyFileName,
            wasmFileName
        });
        const solidityInput = {
            newRoot,
            newSubtrees: endSubtrees,
            p: flattenProof(proof)
        };
        return { proof, publicSignals, solidityInput };
    } catch(err) {
        console.log(err);
        throw new Error(err);
    }
};