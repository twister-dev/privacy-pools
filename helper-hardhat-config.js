const networkConfig = {
    31337: {
        name: "localhost" //put more stuff here
    }
};

const developmentChains = ["hardhat", "localhost"];
const defaultBlockConfirmations = 5;

module.exports = {
    networkConfig,
    developmentChains,
    defaultBlockConfirmations
};
