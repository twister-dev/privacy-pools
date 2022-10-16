const { ethers } = require("hardhat");
const { deploy } = require("./hardhat.utils.js");

const poseidonContract = "0x2CBDd0a80645f5701EB1FbD2AA9076103babd7cC";

async function main() {
    const denomination = ethers.utils.parseEther("0.001");
    await deploy("PrivacyPool", [poseidonContract, denomination], true);
}

main().catch(console.error);
