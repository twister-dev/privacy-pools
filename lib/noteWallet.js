const {
    entropyToMnemonic,
    mnemonicToEntropy
} = require("@ethersproject/hdnode");
const { Wallet } = require("@ethersproject/wallet");
const { poseidon } = require("./poseidon.js");
const { F } = require("./utils.js");

// see: https://github.com/satoshilabs/slips/blob/master/slip-0044.md
const coinType = 9777;

function interiorHdPath(index) {
    return `m/44'/${coinType}'/0'/0/${index}`;
}

function exteriorHdPath(index) {
    return `m/44'/${coinType}'/0'/1/${index}`;
}

function generateInteriorKeys(mnemonic, index) {
    const wallet = Wallet.fromMnemonic(mnemonic, interiorHdPath(index));
    const secret = F.e(wallet.privateKey) % F.p;
    const commitment = poseidon([secret]);
    return { secret, commitment };
}

function generateExteriorKeys(mnemonic, index) {
    const wallet = Wallet.fromMnemonic(mnemonic, exteriorHdPath(index));
    const secret = F.e(wallet.privateKey) % F.p;
    const commitment = poseidon([secret]);
    return { secret, commitment };
}

class NoteWallet {
    constructor(mnemonic, index) {
        try {
            this.mnemonic = entropyToMnemonic(mnemonicToEntropy(mnemonic));
        } catch (err) {
            console.error(err);
            throw new Error(`Invalid mnemonic: ${err}`);
        }
        if (!index) index = 0;
        this.newInteriorKeysFromPath(index);
    }

    newInteriorKeysFromPath(index) {
        const { secret, commitment } = generateInteriorKeys(
            this.mnemonic,
            index
        );
        this.secret = secret;
        this.commitment = commitment;
    }

    newExteriorKeysFromPath(index) {
        const { secret, commitment } = generateExteriorKeys(
            this.mnemonic,
            index
        );
        this.secret = secret;
        this.commitment = commitment;
    }

    nullifierAt(treeIndex) {
        return poseidon([this.secret, 1, treeIndex]);
    }

    keys() {
        return { secret: this.secret, commitment: this.commitment };
    }

    keysAt(treeIndex) {
        return {
            secret: this.secret,
            commitment: this.commitment,
            nullifier: this.nullifierAt(treeIndex)
        };
    }

    encryptToJson(password) {
        return ethers.Wallet.fromMnemonic(this.mnemonic, interiorHdPath(0)).encrypt(password)
    }
}

Object.assign(module.exports, { NoteWallet });
