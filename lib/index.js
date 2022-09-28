const { allowList } = require('./allowList');
const { blockList } = require('./blockList');
const { createSubsetFromFilter } = require('./createSubsetFromFilter');
const { fullProveWithdrawFromSubset } = require('./fullProveWithdrawFromSubset');
const { generateProof } = require('./generateProof');
const { MerkleTree } = require('./merkleTree');
const { poseidon } = require('./poseidon');
const { privacyPool } = require('./privacyPool');
const { subsetRootToSubsetString } = require('./subsetRootToSubsetString');
const { subsetStringToSubsetRoot } = require('./subsetStringToSubsetRoot');
const utils = require('./utils');
const { verifyProof } = require('./verifyProof');

Object.assign(module.exports, {
    allowList,
    blockList,
    createSubsetFromFilter,
    fullProveWithdrawFromSubset,
    generateProof,
    MerkleTree,
    poseidon,
    privacyPool,
    subsetRootToSubsetString,
    subsetStringToSubsetRoot,
    utils,
    verifyProof,
});