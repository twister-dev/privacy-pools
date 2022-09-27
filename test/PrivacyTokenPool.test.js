const { expect } = require('chai');
const { ethers } = require('hardhat');
const { setStorageAt } = require('@nomicfoundation/hardhat-network-helpers');
const { poseidonContract } = require('circomlibjs');
const { poseidon } = require('../lib/poseidon');
const { MerkleTree } = require('../lib/merkleTree');
const { blockList } = require('../lib/blockList');
const { generateProof } = require('../lib/generateProof');
const { verifyProof } = require('../lib/verifyProof');
const utils = require('../lib/utils');
const {
    deploy,
    deployBytes,
    revertSnapshot,
    setNextBlockTimestamp,
    snapshot,
} = require('../scripts/hardhat.utils');

const VERIFIER_JSON = require('../circuits/out/withdraw_from_subset_verifier.json');
const WASM_FNAME = "./circuits/out/withdraw_from_subset_js/withdraw_from_subset.wasm";
const ZKEY_FNAME = "./circuits/out/withdraw_from_subset_final.zkey";

const VERBOSE = false;

// using explicit `function` at this level, instead of an arrow function, gives
// us a persistent state `this` within nested arrow functions in the test
describe("PrivacyTokenPool.sol", function() {

    // we only need to deploy the poseidon contract once, setup params like secrets / commitments
    before(async() => {
        // poseidon hash function evm contract
        const abi = poseidonContract.generateABI(2);
        const bytecode = poseidonContract.createCode(2);
        this.poseidonContract = await deployBytes("Poseidon", abi, bytecode, VERBOSE);

        // 1 ETH pool
        this.token = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
        this.amount = ethers.utils.parseEther("1");
        this.assetMetadata = utils.hashMod(["address", "uint"], [this.token, this.amount]);

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
        // full deposits tree (with all of the commitments in this test)
        this.depositTree = new MerkleTree({hasher: poseidon, levels: 20, baseString: "empty"});
        // empty blocklist (this is right-to-left in terms of deposit index)
        this.blocklist = blockList({
            subsetString: '000000000000000000000000000000000000000000'
        });

        this.privacyTokenPool = await deploy("PrivacyTokenPool", [this.poseidonContract.address], VERBOSE);
    });

    // // deploy a new pool and trees each test
    // beforeEach(async () => {
    //     this.privacyTokenPool = await deploy("PrivacyTokenPool", [this.poseidonContract.address], VERBOSE);
    // });

    it('should deposit 42 times', async () => {
        // check empty root before any deposits
        expect((await this.privacyTokenPool.getLatestRoot()).toString())
            .to.be.equal(this.depositTree.root.toString());

        // we'll check that the pool ETH balance increases after each deposit
        var balanceOfPool = ethers.BigNumber.from(0);

        for (let i = 0; i < 42; i++) {
            // iterate through the good signers for depositor variety
            const signer = this.goodSigners[i%7];
            // force a specific timestamp (to check against block.timestamp emitted in event)
            const timestamp = Date.now();
            await setNextBlockTimestamp(timestamp);

            // deposit using raw commitment, check event log data for commitment
            await expect(
                this.privacyTokenPool.connect(signer).deposit(
                    this.rawCommitments[i], this.token, this.amount, {value: this.amount}
                )
            ).to.emit(this.privacyTokenPool, 'Deposit').withArgs(
                this.rawCommitments[i], this.commitments[i],
                this.token, this.amount, i, timestamp
            );
            // check that the roots match between JS and evm
            await this.depositTree.insert(this.commitments[i]);

            expect((await this.privacyTokenPool.getLatestRoot()).toString())
                .to.be.equal(this.depositTree.root.toString());

            // check pool has received the ETH
            balanceOfPool = balanceOfPool.add(this.amount);
            expect(await ethers.provider.getBalance(this.privacyTokenPool.address))
                .to.be.equal(balanceOfPool);
        }
    });

    it('should withdraw a few times using the empty block list', async() => {

        for (let i = 0; i < 5; i++) {
            // withdraw in order of deposits, get proof inputs
            // private inputs
            const secret = this.secrets[i];
            const path = i;
            const { pathElements: mainProof, pathRoot: root } = await this.depositTree.path(path);
            const { pathElements: subsetProof, pathRoot: subsetRoot } = await this.blocklist.path(path);
            // public inputs
            const nullifier = poseidon([secret, 1, i]);
            const assetMetadata = this.assetMetadata;
            const recipient = this.signers[i].address;
            const refund = 0;
            const relayer = this.signers[0].address;
            const fee = ethers.utils.parseEther("0.02");
            const withdrawMetadata = utils.hashMod(
                ["address", "uint", "address", "uint"],
                [recipient, refund, relayer, fee]
            );
            // generate zkp and verify it in js
            const input = utils.toProofInput({
                root,
                subsetRoot,
                nullifier,
                assetMetadata,
                withdrawMetadata,
                secret,
                path,
                mainProof,
                subsetProof
            });
            const { proof, publicSignals } = await generateProof({
                input,
                wasmFileName: WASM_FNAME,
                zkeyFileName: ZKEY_FNAME
            });
            expect(await verifyProof({proof, publicSignals, verifierJson: VERIFIER_JSON})).to.be.true;
            const flatProof = utils.flattenProof(proof);
            await expect(
                this.privacyTokenPool.withdraw(
                    flatProof,
                    root,
                    subsetRoot,
                    nullifier,
                    this.token,
                    this.amount,
                    recipient,
                    refund,
                    relayer,
                    fee,
                    { value: refund }
                )
            ).to.emit(this.privacyTokenPool, 'Withdrawal').withArgs(
                recipient, relayer, subsetRoot, nullifier, fee
            );
        }
    });
});