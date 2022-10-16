const { ethers } = require("ethers");
const { poseidon } = require("../lib/poseidon.js");
const utils = require("../lib/utils.js");
const { NoteWallet } = require("../lib/noteWallet.js");

(async function main() {
    const mnemonic = ethers.Wallet.createRandom().mnemonic;
    const noteWallet = new NoteWallet(mnemonic.phrase);
    console.log(noteWallet.keys());
})();
