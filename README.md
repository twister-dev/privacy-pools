# Features

-   Deposited funds cannot be locked or stolen (non-custodial and non-restrictive)
-   Zero knowledge proofs secure user's privacy
-   Users have the freedom to choose an anonymity set upon withdrawal
-   Removing illicit deposits from an anonymity subset accomplished two things:
    -   Proves a withdrawal is clean without violating the privacy of the specific user, and
    -   Reduces the anonymity sets of hackers, acting as a deterrent and as a dampening force for illicit activity
-   Enables customizable community driven anti blackhat and anti money laundering coordination in a credibly neutral way

## Read More
You can read more about privacy pools in [docs](./docs).

# Dependencies

-   [npm](https://www.npmjs.com/) / [yarn](https://yarnpkg.com/)
-   [rust](https://www.rust-lang.org/tools/install) / [circom2](https://docs.circom.io/getting-started/installation/)
-   [python3](https://www.python.org/downloads/)

# Install and Test Locally

Only tested on a UNIX-like OS (linux or mac).

### Clone the Repo

```sh
$ git clone https://github.com/twister-dev/privacy-pools
$ cd privacy-pools
```

### Install Dependencies

```sh
$ yarn
```

or

```sh
$ npm install .
```

### Setup Circuit Locally

```sh
$ bash ./scripts/setup.sh
```

### Test the circuit in JS

```sh
$ yarn mocha
```

### Test the circuit in Solidity

```sh
$ hardhat test
```

# Working To Do List

1. Finish Solidity implementation & unit tests
    - PrivacyTokenPool.test.js
        1. Test all revert conditions in the following imported libraries
            - OpenZeppelin reentrancy guard
            - OpenZeppelin safe erc20
        2. Test that an invalid zk proof will revert
        3. Test that a duplicate nullifier (double spend) will revert
        4. Test the msg.value revert conditions in both withdraw and deposit
        5. Test the stale merkle root revert in withdraw
        6. Test the fee > amount revert in withdraw
        7. Test ERC20 token deposits and withdrawals
2. Subset compression and decompression algorithms
    - Merkletree/bitset combo class in accessList.js needs to be finished
    - Finalize the functions (do we need both blockList.js and allowList.js when we have accessList.js?)
    - Implement brotli compression and decompression for the bitstrings
    - Add js unit tests for these algos and functions
3. Contracts/library for posting/retrieving data on-chain
    - ERC721 NFT contract for storing access lists on chain
        1. Will use a `mint` function that emits the `treeType`, `subsetRoot`, and `subsetString` in a log event. The `tokenId = subsetRoot` for the NFT that gets minted. There's not a realistic way to enforce that the subsetString recovers to the subsetRoot, so the minter of the contract should be gated by some admin. Anyone can deploy and manage their own NFT access list contracts.
        2. On-chain metadata will return `block.number` of this event. The user may use the `tokenId` of a `subsetRoot` NFT to recover the `subsetString` and `treeType` from on-chain data. Using this data, they can reconstruct the access list as a merkle tree and use it to do proof of inclusion in either an allow list or a block list.
        3. The maintainers of the NFT contract should digest address information from some authority, ideally a decentralized hacker/scammer/phisher/rugpuller listing dao, but it could be TRM labs or chainalysis oracles as well, or a combination thereof
           a. The js library provides a `createSubsetFromFilter` that generates subset data using a given array of deposits and a user defined `filterFunction`
4. Interface and testnet deployment
    - Simple UI without any styling, can be raw html / css or a framework react/next.js etc
    - The NFT contract might best be deployed on Arbitrum Nova because the dominating cost of the contract execution is going to be calldata for large subsets (anywhere from 80k gas up to 8m gas on mainnet, ouch), and it has low security requirements realistically (since its not enforced by contract storage, but instead just by contract calldata and the zk proof) but we can put the privacy pools somewhere with stronger security guarantees
    - Deposit and withdraw forms
    - Listing of NFTs (somehow make this user friendly, perhaps adding a description to the metadata?) to choose from specific deposit subsets
    - Listing of relayer(s)?
    - Should it display the connected wallet's status (e.g. if its sanctioned)?
    - Should it display any deposits that have been flagged by the list providers as being sus?
    - Should it display a list of the user's deposits
    - Should it give an anonymity estimate based on number of new deposits?
5. Relayer server
    - Only accepts withdrawals from roots that are publicly posted in chosen NFT contracts
    - Tracks the deposits and subsets internally
    - Public registry of relayer IPs, permissionless listing? Since we want to make a static site, there should be some route for relayers to add themselves to the list without needing to update the site
    - I can probably think of multiple ways to decentralize this but probably for the initial demo we should just have one and ignore unknown subset roots
