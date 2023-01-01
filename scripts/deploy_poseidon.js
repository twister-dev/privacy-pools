const { poseidonContract } = require("circomlibjs");
const { deployBytes } = require("./hardhat.utils.js");

// poseidon hash function evm contract
const abi = poseidonContract.generateABI(2);
const bytecode = poseidonContract.createCode(2);

(async function () {
    const signer = await hre.ethers.getSigner();
    console.log(signer);
    await deployBytes("Poseidon", abi, bytecode, true);
})();
