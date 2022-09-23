const { expect } = require('chai');
const { ethers } = require('hardhat');
const { setStorageAt } = require('@nomicfoundation/hardhat-network-helpers');
const { poseidonContract } = require('circomlibjs');
const {
    MerkleTree,
    utils,
    poseidon,
} = require('vmtree-sdk');
const { deployBytes } = require('../scripts/hardhat.utils');

const VERBOSE = false;
const FUNCTION_NAMES = [
    'testInsertStorage',
    'testInsert',
    'testInsertMod',
    'testInsertLoop'
];

async function insert({contract, tree, element, roots, functionName, verbose}) {
    // submit insert tx, get gas from receipt
    const tx = await contract[functionName](element);
    const receipt = await tx.wait();
    if (verbose)
        console.log("insert gas used:", receipt.gasUsed.toString());

    // insert element into js tree, add root to js history
    await tree.insert(element);
    roots.rootIndex = (roots.rootIndex + 1) % 30;
    roots.values[roots.rootIndex] = tree.root;
}

// using explicit `function` at this level, instead of an arrow function, gives
// us a persistent `this` within nested arrow functions in the test
describe("TestMerkleTree.sol - Gas Golfer", function() {
    before(async() => {
        // poseidon hash function evm contract
        const abi = poseidonContract.generateABI(2);
        const bytecode = poseidonContract.createCode(2);
        this.poseidonContract = await deployBytes("Poseidon", abi, bytecode, VERBOSE);
        console.log('   Testing 4 different equivalent functions. Which is the most gas efficient?');
    });

    beforeEach(async () => {
        // deploy merkle tree test contract
        const factory = await ethers.getContractFactory("TestMerkleTree");
        this.merkleTreeContract = await factory.deploy(this.poseidonContract.address);

        // init off-chain merkle tree
        this.merkleTree = new MerkleTree({hasher: poseidon, levels: 20, baseString: "empty"});

        // init off-chain history of roots
        this.roots = {
            rootIndex: 0,
            values: (new Array(30)).fill(0),
        };
        this.roots.values[0] = this.merkleTree.root;

        // calc random values to insert into the tree. using chunks of 30 so we can check when
        // the root history wraps around
        this.leaves = utils.unsafeRandomLeaves(60);
    });

    for (const functionName of FUNCTION_NAMES) {
        it('should have the zero root', async () => {
            // check the initial root (the zero root)
            expect((await this.merkleTreeContract.getLatestRoot()).toString())
                .to.be.equal(this.merkleTree.root.toString());
            console.log(`    Running tests on ${functionName}.`);
        });

        it('should revert when the tree is full', async () => {
            /*
                simulate a full tree by setting the `currentLeafIndex` variable using hardhat
                (it would take too long to compute 1m insertions in a test). the slot was
                found using `hardhat-storage-layout` and running the command `yarn hardhat check`.
            */
            await setStorageAt(
                this.merkleTreeContract.address,
                2,
                1048576 // 2 ** 20
            );
            await expect(this.merkleTreeContract.testInsert(42)).to.be.reverted;
        });

        it('should correctly compute the next root after one insertion', async () => {
            // insert one leaf
            await insert({
                contract: this.merkleTreeContract,
                functionName,
                tree: this.merkleTree,
                roots: this.roots,
                element: this.leaves[0],
                verbose: VERBOSE
            });
            // check the second root
            expect((await this.merkleTreeContract.getLatestRoot()).toString())
                .to.be.equal(this.merkleTree.root.toString());
        });

        it('should correctly compute the next 30 new roots', async () => {
            // do first 29 insert (this gives us a full first 30 roots because of the zero root)
            for (const element of this.leaves.slice(0, 29)) {
                await insert({
                    contract: this.merkleTreeContract,
                    functionName,
                    tree: this.merkleTree,
                    roots: this.roots,
                    element,
                    verbose: VERBOSE
                });
                expect((await this.merkleTreeContract.getLatestRoot()).toString())
                    .to.be.equal(this.merkleTree.root.toString());
            };

            // should remember the first thirty roots (max capacity of roots history)
            for (const root of this.roots.values) {
                expect((await this.merkleTreeContract.isKnownRoot(root)))
                    .to.be.true;
            }

            // do 30th insert, clearing the first root from the history (the zero root)
            const nextToForget = this.roots.values[0];
            expect(await this.merkleTreeContract.isKnownRoot(nextToForget))
                .to.be.true;
            await insert({
                contract: this.merkleTreeContract,
                functionName,
                tree: this.merkleTree,
                roots: this.roots,
                element: this.leaves[29],
                verbose: VERBOSE
            });
            expect((await this.merkleTreeContract.getLatestRoot()).toString())
                .to.be.equal(this.merkleTree.root.toString());

            // should have overwritten original root now
            expect(await this.merkleTreeContract.isKnownRoot(nextToForget))
                .to.be.false;
        }).timeout(100000);

        it('should correctly compute 60 new roots and forget the first thirty', async () => {
            // return to previous test state
            for (const element of this.leaves.slice(0, 29)) {
                await insert({
                    contract: this.merkleTreeContract,
                    functionName,
                    tree: this.merkleTree,
                    roots: this.roots,
                    element,
                    verbose: VERBOSE
                });
            };
            // snapshot of first 30 roots
            const firstThirtyRoots = [...this.roots.values];
            // return to last test's state (we already checked that the first root erased)
            await insert({
                contract: this.merkleTreeContract,
                functionName,
                tree: this.merkleTree,
                roots: this.roots,
                element: this.leaves[29],
                verbose: VERBOSE
            });

            // repeat the test but with another 30 leaves. again do 29 inserts first
            for (const element of this.leaves.slice(30, 59)) {
                await insert({
                    contract: this.merkleTreeContract,
                    functionName,
                    tree: this.merkleTree,
                    roots: this.roots,
                    element,
                    verbose: VERBOSE
                });
                expect((await this.merkleTreeContract.getLatestRoot()).toString())
                    .to.be.equal(this.merkleTree.root.toString());
            };

            // should remember current roots
            for (const root of this.roots.values) {
                expect((await this.merkleTreeContract.isKnownRoot(root)))
                    .to.be.true;
            }

            // by now we've forgotten all of the original roots
            for (const root of firstThirtyRoots) {
                expect((await this.merkleTreeContract.isKnownRoot(root)))
                    .to.be.false;
            }

            // final insert of 60 total. check that the roots index resets again
            const nextToForget = this.roots.values[0];
            expect((await this.merkleTreeContract.isKnownRoot(nextToForget)))
                .to.be.true;
            await insert({
                contract: this.merkleTreeContract,
                functionName,
                tree: this.merkleTree,
                roots: this.roots,
                element: this.leaves[59],
                verbose: VERBOSE
            });
            expect((await this.merkleTreeContract.getLatestRoot()).toString())
                .to.be.equal(this.merkleTree.root.toString());

            expect((await this.merkleTreeContract.isKnownRoot(nextToForget)))
                .to.be.false;
        });
    }
});