const { BigNumber } = require('@ethersproject/bignumber');

function getFilledSubtreeIndex(elementIndex, layerIndex) {
    return BigNumber.from(2).mul(
        BigNumber.from(elementIndex).div(
            BigNumber.from(2).pow(BigNumber.from(layerIndex).add(1))
        )
    );
}

for (let i = 0; i < 3; i++) {
    console.log(getFilledSubtreeIndex(3, i).eq(getFilledSubtreeIndex(5, i)));
}

Object.assign(module.exports, { getFilledSubtreeIndex });