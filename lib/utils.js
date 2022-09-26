const { BigNumber } = require("@ethersproject/bignumber");
const { keccak256 } = require("@ethersproject/keccak256");
const { keccak256: solidityKeccak256 } = require("@ethersproject/solidity");
const { randomBytes } = require("@ethersproject/random");
const { utils: { stringifyBigInts }, Scalar, ZqField } = require("ffjavascript");

// max snark field element
const F = new ZqField(Scalar.fromString(
    "21888242871839275222246405745257275088548364400416034343698204186575808495617"
));

// returns keccak256(data) % snark_scalar_value
function hashMod(types, values) {
    return BigNumber.from(solidityKeccak256(types, values)).mod(F.p.toString());
}

// zero value from a string
function getZero(baseString) {
    return hashMod(['string'], [baseString]);
}

// Empty nodes in the tree, each level gets a unique zero hash.
// The last element in the array is the root of the empty tree.
function calculateZeros({ hasher, levels = 20, zeroValue = 0 }) {
    const result = [zeroValue];
    for (let i = 0; i < levels; i++) {
        zeroValue = hasher([zeroValue, zeroValue]);
        result.push(zeroValue.toString());
    }
    return result;
}

// Convert to field element.
function toFE(value) {
    if (value instanceof Uint8Array)
        value = BigNumber.from(value)
    return F.e(value.toString());
};

// Stringify values for groth16 prover. Checks first if a value is an array, else assumes
// it is a valid input to BigNumber.from().
function toProofInput(obj) {
    Object.entries(obj).map(([key, val]) => {
        if (Array.isArray(val)) {
            obj[key] = val.map(v => BigNumber.from(v).toString());
        } else {
            obj[key] = BigNumber.from(val).toString();
        }
    });
    return obj;
}

// Flatten proof from three variables into one for solidity calldata.
function flattenProof(proof) {
    return [
        proof.pi_a[0], proof.pi_a[1], proof.pi_b[0][1], proof.pi_b[0][0],
        proof.pi_b[1][1], proof.pi_b[1][0], proof.pi_c[0], proof.pi_c[1]
    ];
};

// Use this to generate sol input from the snarkjs output of groth16prove.
function toSolidityInput({ input, proof, publicSignals, levels = 20 }) {
    return {
        newRoot: publicSignals[0],
        newSubtrees: publicSignals.slice(2 + levels, 2 + 2 * levels),
        p: flattenProof(proof)
    };
};

// Unsafe because they are not cryptographic commitments, just random values.
// Can use this to generate an array of secrets, though.
function unsafeRandomLeaves(length) {
    return (new Array(length)).fill(31).map(randomBytes).map(toFE);
};

Object.assign(module.exports, {
    F,
    calculateZeros,
    flattenProof,
    hashMod,
    getZero,
    stringifyBigInts,
    unsafeRandomLeaves,
    toFE,
    toProofInput,
    toSolidityInput,
});