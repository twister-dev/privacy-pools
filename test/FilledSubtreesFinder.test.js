const { expect } = require("chai");
const { ethers } = require("hardhat");
const { getFilledSubtreeIndex } = require("../lib/filledSubtreesFinder");

describe("FilledSubtreeFinder.sol", function () {
    before(async () => {
        const factory = await ethers.getContractFactory("FilledSubtreesFinder");
        this.finder = await factory.deploy();
    });

    it("should match between js and solidity", async () => {
        // per element
        for (let i = 0; i < 10; i++) {
            // per layer
            for (let j = 0; j < 20; j++) {
                await this.finder.getFilledSubtreeIndexGasIndex(i, j);
                expect(
                    await this.finder.getFilledSubtreeIndex(i, j)
                ).to.be.equal(getFilledSubtreeIndex(i, j));
            }
        }
    }).timeout(300000);
});
