const { MerkleTree } = require("fixed-merkle-tree");
const { ALLOWED, BLOCKED } = require('./utils');

Object.assign(module.exports, {
    AccessList: class extends MerkleTree {
        constructor({
            hasher,
            levels = 20,
            treeType,
            subsetString,
        }) {
            let zeroElement, oneElement;
            switch (treeType) {
                case "allowlist":
                    [zeroElement, oneElement] = [BLOCKED, ALLOWED];
                    break;
                case "blocklist":
                    [zeroElement, oneElement] = [ALLOWED, BLOCKED];
                    break;
            }
            super(levels, leaves, {
                hashFunction: (left, right) => hasher([left, right]),
                zeroElement,
            });
            try {
                this.subset = new BitSet(subsetString)
            } catch (err) {
                throw new Error(`Error constructing bitset: ${err}`);
            }
            this.oneElement = oneElement;
        }

        async resizeIfNecessary(index) {
            if (this.elements().length < (index + 1)) {
                const extender = (new Array(this.elements().length - (index + 1)))
                    .fill(this.zeroElement);
                try {
                    await this.bulkInsert(extender);
                } catch (err) {
                    console.error(err);
                    throw new Error(err);
                }
            }
        }

        // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], .. [11, 12]
        // set 12 = 1
        // length = 11
        // new length = 13 = index + 1
        // difference = index + 1 - length = 2
        async setBit(index, bit) {
            try {
                await resizeIfNecessary(index);
            } catch (err) {
                throw new Error(`Error resizing the tree: ${err}`);
            }
            this.subset.set(index, bit);
            await this.update(index, this.oneElement);
        }

        async allow(index) {
            if (this.elements().length < (index + 1)) {
                const extender = (new Array(this.elements().length - (index + 1)))
                    .fill(this.zeroElement);
                try {
                    await this.bulkInsert(extender);
                } catch (err) {
                    console.error(err);
                    throw new Error(err);
                }
            }
            this.subset.set(index, bit);
            await this.update(index, this.oneElement);
        }

        async block(index) {
            if (this.elements().length < (index + 1)) {
                const extender = (new Array(this.elements().length - (index + 1)))
                    .fill(this.zeroElement);
                try {
                    await this.bulkInsert(extender);
                } catch (err) {
                    console.error(err);
                    throw new Error(err);
                }
            }
            this.subset.set(index, bit);
            await this.update(index, this.oneElement);
        }
    }
});