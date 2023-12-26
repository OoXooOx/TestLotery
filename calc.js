const fs = require("fs");
const { BigNumber, ethers } = require('ethers');
const balances = require("./balances.json");
const holdersForLotery = require("./holdersForLotery.json");
let totalSupplyForLoteryRounded = require("./totalSupplyForLoteryRounded.json");
//ethers.constants.AddressZero
//0x95524B223810E640ed3748bD072fc6affbdb65d3
//0xDb4CE33fbD72aA160bE47Bc382e53038AD75aFDD
//0x0ec92a16261589bBf2F265e599714856EB9CEA61
const from = "0xDb4CE33fbD72aA160bE47Bc382e53038AD75aFDD"; // 300000000
const to = ethers.constants.AddressZero; // 100000000
const value = BigNumber.from("0x3938700");

if (from !== to) {
    const handleMint = () => {
        const sumHex = '0x' + (baseConvertedValue_to + eventConvertedValue).toString(16);
        if (!balances[to]) {
            balances[to] = { value: null, index: null };
        }
        balances[to].value = sumHex;

        const roundedBaseConvertedValue_to = Math.floor(parseFloat(baseConvertedValue_to/oneToken));
        const roundedSumHex = Math.floor(parseFloat(BigInt(sumHex)/oneToken));
        totalSupplyForLoteryRounded += roundedSumHex-roundedBaseConvertedValue_to;

        if (sumHex >= oneToken && baseConvertedValue_to < oneToken) {
            holdersForLotery.push(to);
            balances[to].index = holdersForLotery.length - 1;
        }
    };

    const handleBurn = () => {
        const subHex = '0x' + (baseConvertedValue_from - eventConvertedValue).toString(16);
        balances[from].value = subHex;

        const roundedBaseConvertedValue_from = Math.floor(parseFloat(baseConvertedValue_from/oneToken));
        const roundedSubHex = Math.floor(parseFloat(BigInt(subHex)/oneToken));
        totalSupplyForLoteryRounded -= roundedBaseConvertedValue_from-roundedSubHex;

        if (subHex < oneToken && baseConvertedValue_from>=oneToken) {
            balances[holdersForLotery[holdersForLotery.length - 1]].index = balances[from].index;
            holdersForLotery[balances[from].index] = holdersForLotery[holdersForLotery.length - 1];
            holdersForLotery.pop();
            balances[from].index = null;
        }
    };

    const handleTransfer = () => {
        const sumHex = '0x' + (baseConvertedValue_to + eventConvertedValue).toString(16);
        const subHex = '0x' + (baseConvertedValue_from - eventConvertedValue).toString(16);
        balances[from].value = subHex;
        if (subHex < oneToken && baseConvertedValue_from>=oneToken) {
            balances[holdersForLotery[holdersForLotery.length - 1]].index = balances[from].index;
            holdersForLotery[balances[from].index] = holdersForLotery[holdersForLotery.length - 1];
            holdersForLotery.pop();
            balances[from].index = null;
        }
        if (!balances[to]) {
            balances[to] = { value: null, index: null };
        }
        balances[to].value = sumHex;
        if (sumHex >= oneToken && baseConvertedValue_to < oneToken) {
            holdersForLotery.push(to);
            balances[to].index = holdersForLotery.length - 1;
        }
    };

    const oneToken = BigInt("0x5F5E100");
    const eventConvertedValue = BigInt(value._hex);
    let baseConvertedValue_to = BigInt(0);
    if (balances[to]) {
        const baseValue_to = balances[to].value;
        baseConvertedValue_to = BigInt(baseValue_to);
    }
    let baseConvertedValue_from = BigInt(0);
    if (balances[from]) {
        const baseValue_from = balances[from].value;
        baseConvertedValue_from = BigInt(baseValue_from);
    }
    
    if (from === ethers.constants.AddressZero) {
        handleMint();
    } else if (to === ethers.constants.AddressZero) {
        handleBurn();
    } else {
        handleTransfer();
    }
    // it's not good, complexity O(n), but we accept this in our case
    fs.writeFile('balances.json', JSON.stringify(balances), (err) => {
        if (err) {
            console.error("Error writing balances.json:", err);
        }
    })
    fs.writeFile('holdersForLotery.json', JSON.stringify(holdersForLotery), (err) => {
        if (err) {
            console.error("Error writing holdersForLotery.json:", err);
        }
    })
    fs.writeFile('totalSupplyForLoteryRounded.json', JSON.stringify(totalSupplyForLoteryRounded), (err) => {
        if (err) {
            console.error("Error writing totalSupplyForLoteryRounded.json:", err);
        }
    })
    console.log(totalSupplyForLoteryRounded);
    console.log(balances);
}
