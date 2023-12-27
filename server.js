const { BigNumber, ethers } = require('ethers');
const crypto = require('crypto');
const express = require('express');
const ABI = require('./ABI.json');
const fs = require("fs");
const app = express();

const balances = require("./balances");
const holdersForLotery = require("./holdersForLotery");
const { createSignature } = require("./createSignature");
let totalSupplyForLoteryRounded = require("./totalSupplyForLoteryRounded.json");
const nonces = require("./nonces.json");

const provider = new ethers.providers.JsonRpcProvider('https://ethereum-goerli.publicnode.com');
//goerli 0xaa6b081660709F8cBB9a8FA6782354F5e61A41ed  SC address predictor
const contractAddress = '0xb90A4104787b84b89B27C06A7185dd5CDc557DF5';
const operator = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
// const DOMAIN_SEPARATOR = "0x04886e1af7b232721ab2204ede9ab4abe712a00af54f3000ec946dbd091651bf";

const enableLotery = true;

const contract = new ethers.Contract(contractAddress, ABI, provider);
const loteryTickets = new Map();
const oneToken = BigInt("0x5F5E100");// 1*10**8 

const fillInfoInBase = (from, to, value) => {
    try {
        if (from !== to) {
            const handleMint = () => {
                const sumHex = '0x' + (baseConvertedValue_to + eventConvertedValue).toString(16);
                if (!balances[to]) {
                    balances[to] = { value: null, index: null };
                }
                balances[to].value = sumHex;

                const roundedBaseConvertedValue_to = Math.floor(parseFloat(baseConvertedValue_to / oneToken));
                const roundedSumHex = Math.floor(parseFloat(BigInt(sumHex) / oneToken));
                totalSupplyForLoteryRounded += roundedSumHex - roundedBaseConvertedValue_to;

                if (sumHex >= oneToken && baseConvertedValue_to < oneToken) {
                    holdersForLotery.push(to);
                    balances[to].index = holdersForLotery.length - 1;
                }
            };

            const handleBurn = () => {
                const subHex = '0x' + (baseConvertedValue_from - eventConvertedValue).toString(16);
                balances[from].value = subHex;

                const roundedBaseConvertedValue_from = Math.floor(parseFloat(baseConvertedValue_from / oneToken));
                const roundedSubHex = Math.floor(parseFloat(BigInt(subHex) / oneToken));
                totalSupplyForLoteryRounded -= roundedBaseConvertedValue_from - roundedSubHex;

                if (subHex < oneToken && baseConvertedValue_from >= oneToken) {
                    balances[holdersForLotery[holdersForLotery.length - 1]].index = balances[from].index;
                    holdersForLotery[balances[from].index] = holdersForLotery[holdersForLotery.length - 1];
                    holdersForLotery.pop();
                    balances[from].index = null;
                }
            };

            const handleTransfer = () => {
                try {
                    const sumHex = '0x' + (baseConvertedValue_to + eventConvertedValue).toString(16);
                    const subHex = '0x' + (baseConvertedValue_from - eventConvertedValue).toString(16);
                    console.log("sumHex from transfer", sumHex);
                    console.log("subHex from transfer", subHex);
                    balances[from].value = subHex;
                    if (subHex < oneToken && baseConvertedValue_from >= oneToken) {
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

                    const roundedBaseConvertedValue_to = Math.floor(parseFloat(baseConvertedValue_to / oneToken));
                    const roundedSumHex = Math.floor(parseFloat(BigInt(sumHex) / oneToken));
                    totalSupplyForLoteryRounded += roundedSumHex - roundedBaseConvertedValue_to;

                    const roundedBaseConvertedValue_from = Math.floor(parseFloat(baseConvertedValue_from / oneToken));
                    const roundedSubHex = Math.floor(parseFloat(BigInt(subHex) / oneToken));
                    totalSupplyForLoteryRounded -= roundedBaseConvertedValue_from - roundedSubHex;
                } catch (err) {
                    console.log(err.message);
                }
            };

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
            console.log("totalSupplyForLoteryRounded", totalSupplyForLoteryRounded);
            console.log("balances", balances);
        }
    } catch (err) {
        console.log(err.message);
    }
}

const createLoteryTickets = () => {

    try {
        let rightStartPoint = Math.floor(totalSupplyForLoteryRounded / 2) + 1;
        let leftStartPoint = Math.floor(totalSupplyForLoteryRounded / 2);
        let totalQuantityTokensForLotery = totalSupplyForLoteryRounded;
        let holdersTemp = [...holdersForLotery];
        let balancesTemp = JSON.parse(JSON.stringify(balances));
        let count = 0;
        let countOfNotEnoughFounds = 0;
        while (totalQuantityTokensForLotery > 0) {
            if (count == 0) {
                if (holdersTemp.length > totalSupplyForLoteryRounded - rightStartPoint + 1) {
                    let howMuchIcanFill = totalSupplyForLoteryRounded - rightStartPoint + 1;
                    let IcanFill = holdersTemp.slice(0, howMuchIcanFill);
                    let cantFill = holdersTemp.slice(howMuchIcanFill, holdersTemp.length);
                    for (let i = 0; i < IcanFill.length; i++) {
                        loteryTickets.set(rightStartPoint + i, IcanFill[i]);
                        const converted = BigInt(balancesTemp[IcanFill[i]].value);
                        balancesTemp[IcanFill[i]] = converted - oneToken;
                        if (BigInt(balancesTemp[IcanFill[i]].value) >= oneToken) {
                            cantFill.push(IcanFill[i]);
                        }
                    }
                    totalQuantityTokensForLotery -= IcanFill.length;
                    holdersTemp = cantFill;
                    rightStartPoint = totalSupplyForLoteryRounded + 1;
                    count = 1;
                } else {
                    for (let i = 0; i < holdersTemp.length; i++) {
                        loteryTickets.set(rightStartPoint + i, holdersTemp[i]);
                        const convertedHolderBaseValue = BigInt(balancesTemp[holdersTemp[i]].value);
                        balancesTemp[holdersTemp[i]].value = convertedHolderBaseValue - oneToken;
                        if (BigInt(balancesTemp[holdersTemp[i]].value) < oneToken) {
                            let tempForSwitch = holdersTemp[i];
                            holdersTemp[i] = holdersTemp[countOfNotEnoughFounds];
                            holdersTemp[countOfNotEnoughFounds] = tempForSwitch;
                            countOfNotEnoughFounds++;
                        }
                    }
                    totalQuantityTokensForLotery -= holdersTemp.length;
                    rightStartPoint += holdersTemp.length;
                    let result = new Array(holdersTemp.length - countOfNotEnoughFounds);
                    for (let j = countOfNotEnoughFounds; j < holdersTemp.length; j++) {
                        result[j - countOfNotEnoughFounds] = holdersTemp[j];
                    }
                    holdersTemp = result;
                    count = 1;
                    countOfNotEnoughFounds = 0;
                }
            } else {
                for (let i = 0; i < holdersTemp.length; i++) {
                    loteryTickets.set(leftStartPoint - i, holdersTemp[i]);
                    const convertedHolderBaseValue = BigInt(balancesTemp[holdersTemp[i]].value);
                    balancesTemp[holdersTemp[i]].value = convertedHolderBaseValue - oneToken;
                    if (BigInt(balancesTemp[holdersTemp[i]].value) < oneToken) {
                        let tempForSwitch = holdersTemp[i];
                        holdersTemp[i] = holdersTemp[countOfNotEnoughFounds];
                        holdersTemp[countOfNotEnoughFounds] = tempForSwitch;
                        countOfNotEnoughFounds++;
                    }
                }
                leftStartPoint -= holdersTemp.length;
                totalQuantityTokensForLotery -= holdersTemp.length;
                let result = new Array(holdersTemp.length - countOfNotEnoughFounds);
                for (let j = countOfNotEnoughFounds; j < holdersTemp.length; j++) {
                    result[j - countOfNotEnoughFounds] = holdersTemp[j];
                }
                holdersTemp = result;
                if (rightStartPoint <= totalSupplyForLoteryRounded) {
                    count = 0;
                }
                countOfNotEnoughFounds = 0;
            }
        }
        // console.log(loteryTickets);
    } catch (err) {
        console.log(err.message);
    }
}

const getRandomInt = (min, max) => {
    const range = max - min + 1;
    const bytesNeeded = Math.ceil(Math.log2(range) / 8);
    let randomInt;
    do {
        const randomBytes = crypto.randomBytes(bytesNeeded);
        randomInt = randomBytes.readUIntBE(0, bytesNeeded);
    } while (randomInt >= range);
    return min + randomInt;
}

const executeLotery = (loteryTicket) => loteryTickets.get(loteryTicket)
//ethers.constants.AddressZero
//0x95524B223810E640ed3748bD072fc6affbdb65d3
//0xDb4CE33fbD72aA160bE47Bc382e53038AD75aFDD
//0x0ec92a16261589bBf2F265e599714856EB9CEA61
contract.on('Transfer', async (from, to, value, rewards) => {
    // const test = async () => {
    // const from = ethers.constants.AddressZero;
    // const from = "0xDb4CE33fbD72aA160bE47Bc382e53038AD75aFDD";
    // const to = "0x95524B223810E640ed3748bD072fc6affbdb65d3";
    // const value = BigNumber.from("0x37B16E580"); // 149.5
    // const value = BigNumber.from("0xB2D05E00"); // 30
    // const value = BigNumber.from("0xBA43B7400"); // 500
    // const value = BigNumber.from("0x8F0D180"); // 1.5
    // const value = BigNumber.from("0x2FAF080"); // 0.5 
    // const value = BigNumber.from("0x1312D00"); // 0.2 
    // const value = BigNumber.from("0xE8D4A51000"); // 10 000 
    // const value = BigNumber.from("0x9184E72A000"); //100 000 
    // const value = BigNumber.from("0x48C27395000"); //50 000
    // const rewards = BigNumber.from("0x0");
    try {
        console.log("from:", from, "to:", to, "value:", value, "rewards:", rewards);
        console.log("balances before", balances);
        console.log("holdersForLotery before", holdersForLotery);
        console.log("totalSupplyForLoteryRounded before", totalSupplyForLoteryRounded);

        fillInfoInBase(from, to, value);
        if (from !== ethers.constants.AddressZero && enableLotery && to !== ethers.constants.AddressZero) {
            createLoteryTickets();
            const loteryTicket = getRandomInt(1, totalSupplyForLoteryRounded);
            const winner = executeLotery(loteryTicket);
            console.log("winner loteryTicket number:", loteryTicket);
            console.log("address winner:", winner);
            console.log("loteryTickets.size", loteryTickets.size);
            const DOMAIN_SEPARATOR = await contract.DOMAIN_SEPARATOR();
            let currentWinnerNonce = nonces[winner] || 0;
            console.log("nonce", currentWinnerNonce);
            const signature = createSignature(
                winner,              
                rewards._hex,       
                currentWinnerNonce++,                       
                DOMAIN_SEPARATOR);
            nonces[winner] = currentWinnerNonce;
            const { r, s, v } = ethers.utils.splitSignature(signature);
            fs.writeFile('nonces.json', JSON.stringify(nonces), (err) => {
                if (err) {
                    console.error("Error writing nonces.json:", err);
                }
            })    
            console.log('r:', r);
            console.log('s:', s);
            console.log('v:', v);
            console.log("rewards", rewards._hex);
        }
    } catch (err) {
        console.log(err.message);
    }

}
    // test();
);

// Start Server
const port = 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
