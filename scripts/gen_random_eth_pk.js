const fs = require("fs");
const { ethers } = require("ethers");

(async function () {
    const wallet = ethers.Wallet.createRandom();
    const data = `TESTNET_ADDRESS=${wallet.address}\nTESTNET_PRIVATE_KEY=${wallet.privateKey}`;
    console.log(wallet.mnemonic);
    // fs.writeFileSync(`.env.${Date.now()}`, data);
})();
