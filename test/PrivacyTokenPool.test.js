const { expect } = require('chai');
const { ethers } = require('hardhat');
const { setStorageAt } = require('@nomicfoundation/hardhat-network-helpers');
const { poseidonContract } = require('circomlibjs');
const { poseidon } = require('../lib/poseidon');
const { MerkleTree } = require('../lib/merkleTree');
const utils = require('../lib/utils');
const { deploy, deployBytes, setNextBlockTimestamp } = require('../scripts/hardhat.utils');

const VERBOSE = false;

function hashAssetMetadata({token, denomination}) {
    return BigNumber.from(
        keccak256(["address", "uint"], [token, denomination])
    ).mod(utils.F.p.toString());
};

function hashWithdrawMetadata({recipient, refund, relayer, fee}) {
    return BigNumber.from(
        keccak256(["address", "uint", "address", "uint"], [recipient, refund, relayer, fee])
    ).mod(utils.F.p.toString());
}

// using explicit `function` at this level, instead of an arrow function, gives
// us a persistent state `this` within nested arrow functions in the test
describe("PrivacyTokenPool.sol", function() {

    // we only need to deploy the poseidon contract once
    before(async() => {
        // poseidon hash function evm contract
        const abi = poseidonContract.generateABI(2);
        const bytecode = poseidonContract.createCode(2);
        this.poseidonContract = await deployBytes("Poseidon", abi, bytecode, VERBOSE);

        // 1 ETH pool
        this.assetMetadata = utils.hashMod(
            ["address", "uint"],
            ["0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", "1000000000000000000"]
        );
        // console.log('assetMetadata', this.assetMetadata.toString());

        // random secrets and commitments
        this.secrets = utils.unsafeRandomLeaves(42);
        this.rawCommitments = new Array(42);
        this.commitments = new Array(42);
        this.secrets.forEach((secret, i) => {
            this.rawCommitments[i] = poseidon([secret]);
            this.commitments[i] = poseidon([
                this.rawCommitments[i],
                this.assetMetadata
            ]);
        });

        // accounts
        this.signers = await ethers.getSigners();
        // not hackers. good guys
        this.goodSigners = this.signers.slice(0, 7);
        // hackers. bad guys
        this.badSigners = this.signers.slice(7);
    });

    // deploy a new pool and trees each test
    beforeEach(async () => {
        this.privacyTokenPool = await deploy("PrivacyTokenPool", [this.poseidonContract.address], VERBOSE);
    });

    it('should deposit 42 times', async () => {
        const token = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
        const amount = ethers.utils.parseEther("1");
        for (let i = 0; i < 42; i++) {
            const timestamp = Date.now();
            await setNextBlockTimestamp(timestamp);
            await expect(this.privacyTokenPool.deposit(this.rawCommitments[i], token, amount, {value: amount}))
                .to.emit(this.privacyTokenPool, 'Deposit').withArgs(
                    this.rawCommitments[i],
                    this.commitments[i],
                    token, amount, i, timestamp
                );
        }
    });
});