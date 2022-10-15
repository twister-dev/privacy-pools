require("@nomicfoundation/hardhat-chai-matchers");
require("hardhat-gas-reporter");
require("dotenv").config();

// require('hardhat-storage-layout');

const { MAINNET_PRIVATE_KEY, MAINNET_URL, TESTNET_PRIVATE_KEY, TESTNET_URL } =
    process.env;

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            // loggingEnabled: true,
        },
        testnet: {
            accounts: [TESTNET_PRIVATE_KEY],
            url: TESTNET_URL
        }
        // mainnet: {
        //     accounts: [MAINNET_PRIVATE_KEY],
        //     url: MAINNET_URL,
        // }
    },
    paths: {
        sources: "./contracts",
        cache: "./build/cache",
        artifacts: "./build/artifacts",
        tests: "./test"
    },
    solidity: {
        compilers: [
            {
                version: "0.8.17",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 1048576 * 2
                    }
                }
            }
        ]
    }
};
