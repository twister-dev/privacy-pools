const { poseidonContract } = require("circomlibjs");
const { deployBytes } = require("./hardhat.utils.js");

// poseidon hash function evm contract
const abi = poseidonContract.generateABI(2);
const bytecode = poseidonContract.createCode(2);

(async function () {
    await deployBytes("Poseidon", abi, bytecode, true);
})();
