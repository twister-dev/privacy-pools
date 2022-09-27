const { BitSet } = require('bitset');
const { poseidon: hasher } = require('./poseidon');
const { MerkleTree } = require('./merkleTree');
const { ALLOWED, BLOCKED } = require("./utils");

function allowList({ subsetString }) {
    const subset = new BitSet(subsetString);
    const allowlist = new Array(subsetString.length);
    for (let i = 0; i < allowlist.length; i++) {
        allowlist[i] = subset.get(i) ? ALLOWED : BLOCKED;
    }
    const tree = new MerkleTree({ hasher, leaves: allowlist, zeroValue: BLOCKED });
    tree.subset = subset;
    tree.treeType = "allowlist";
    return tree;
}

// class AllowList extends MerkleTree {
//     constructor ({ subsetString }) {
//         this.subset = new BitSet(subsetString);
//         const leaves = new Array(subsetString.length);
//         for (let i = 0; i < allowlist.length; i++) {
//             leaves[i] = subset.get(i) ? ALLOWED : BLOCKED;
//         }

//     }
// }

Object.assign(module.exports, { allowList });