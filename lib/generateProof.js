const snarkjs = require('snarkjs');
console.log(snarkjs);
const groth16 = snarkjs.groth16;
console.log(groth16);
const { fullProve } = groth16;
console.log(fullProve);
// const { groth16 } = require("snarkjs");
// const { fullProve } = require("snarkjs").groth16;

// I added this file as a wrapper so that consuming code doesn't need to add
// snarkjs as a dependency
Object.assign(module.exports, {
    generateProof: async function ({ input, wasmFileName, zkeyFileName }) {
        return fullProve(input, wasmFileName, zkeyFileName);
    }
});
