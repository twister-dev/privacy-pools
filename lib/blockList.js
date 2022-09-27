const { BitSet } = require('bitset');
const { poseidon: hasher } = require('./poseidon');
const { MerkleTree } = require('./merkleTree');
const { ALLOWED, BLOCKED } = require("./utils");

function blockList({ subsetString }) {
    const subset = new BitSet(subsetString);
    const blocklist = new Array(subsetString.length);

    for (let i = 0; i < blocklist.length; i++) {
        if (subset.get(i)) {
            blocklist[i] = BLOCKED;
        } else {
            blocklist[i] = ALLOWED;
        }
    }
    const tree = new MerkleTree({ hasher, leaves: blocklist, zeroValue: ALLOWED });
    tree.subset = subset;
    tree.treeType = "blocklist";
    return tree;
}

Object.assign(module.exports, { blockList });