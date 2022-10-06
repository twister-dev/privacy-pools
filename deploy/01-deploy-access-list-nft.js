const { network } = require("hardhat");
const { developmentChains, defaultBlockConfirmations } = require("../helper-hardhat-config");
const { verify } = require("../scripts/hardhat.utils");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    log("----------------------------------------------------");

    const byteCode = 0x1234
    arguments = [0, "blocklist", byteCode];
    const accessListNFT = await deploy("AccessListNFT", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations:
            network.config.blockConfirmations || defaultBlockConfirmations
    });

    // verify the deployment
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        log("Verifying...");
        await verify(basicNft.address, arguments);
    }
};

module.exports.tags = ["all", "accessListNFT"];
