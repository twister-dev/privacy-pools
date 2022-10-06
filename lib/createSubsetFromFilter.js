const { BitSet } = require("bitset");

/**
 * Deposits is an array of the deposit object:
 * {
 *      sender,
 *      commitment,
 *      leaf,
 *      token,
 *      amount,
 *      leafIndex,
 *      timestamp
 * }
 *
 * filterFunction returns true if you want to set the bit there to 1, else false
 *
 * returns a string binary representation, indexed from right to left
 */
async function createSubsetFromFilter({ deposits, filterFunction }) {
    const subset = new BitSet();
    for (let i = 0; i < deposits.length; i++) {
        subset.set(i, filterFunction(deposits[i]) === true ? 1 : 0);
    }
    return subset.toString();
}

// var BAD_ADDRESSES = {
//     '0xbaebaebaebae0000eaf0fe0e0fe0faf0af0e0a0f': true,
// }

// var BAD_TOKENS = {
//     '0xaefacebabc0deaeabcdeaf0987578966a9cea9c9': true,
// }

// function exampleFilterFunction({
//     sender,
//     // commitment,
//     // leaf,
//     token,
//     // amount,
//     // leafIndex,
//     // timestamp
// }) {
//     return BAD_ADDRESSES[sender] === true || BAD_TOKENS[token] === true;
// }

Object.assign(module.exports, { createSubsetFromFilter });
