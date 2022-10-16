const { expect } = require("chai");
const { network, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config"); //TODO: remove this shit
const { deploy } = require("../scripts/hardhat.utils");
const utils = require("../lib/utils");

const VERBOSE = false;
const NULL_BYTES = 0x00;

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("AccessListNFT.sol", function () {
          beforeEach(async () => {
              this.signers = await ethers.getSigners();

              this.subsetRoot = utils.getZero("allowed");
              this.treeType = NULL_BYTES;
              this.subsetString = NULL_BYTES;

              this.accessListNFT = await deploy(
                  "AccessListNFT",
                  [this.subsetRoot, this.treeType, this.subsetString],
                  VERBOSE
              );
          });

          it("Should allow the owner to mint an NFT and emit a Mint Event", async () => {
              const txResponse = await this.accessListNFT.mintNft();
              await expect(txResponse)
                  .to.emit(this.accessListNFT, "MintEvent")
                  .withArgs(this.subsetRoot, this.treeType);
          });

          it("Should be reverted because it is not called by the owner", async () => {
              await expect(
                  this.accessListNFT
                      .connect(this.signers[1])
                      .mintNft()
              ).to.be.revertedWith("Ownable: caller is not the owner");
          });

          it("Should check if token Id of the NFT is equal to the subsetRoot value", async () => {
              expect(
                  (await this.accessListNFT.getTokenId()).toString()
              ).to.be.equal(this.subsetRoot);
          });
      });
