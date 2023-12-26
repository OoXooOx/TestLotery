const { BigNumber, ethers } = require('ethers');
const { sample } = require("./test1");
const fs = require("fs");
const prev = BigInt("0x1443FD00");
const oneToken = BigInt("0x5F5E100");
const multiplicator = BigInt("0x4")
const result = prev - multiplicator * oneToken;


const originalValue = BigNumber.from('0x13AB6680');
const decimals = 8;

const formattedValue = ethers.utils.formatUnits(originalValue, decimals);
const integerValue = Math.floor(parseFloat("0.9"));
const loteryTickets = new Map();

const crypto = require('crypto');

function getRandomInt(min, max) {
  const range = max - min + 1;
  const bytesNeeded = Math.ceil(Math.log2(range) / 8);

  let randomInt;
  do {
    const randomBytes = crypto.randomBytes(bytesNeeded);
    randomInt = randomBytes.readUIntBE(0, bytesNeeded);
  } while (randomInt >= range);
  return min + randomInt;
}
var a = 12345670000000000000n;
var b = 1000000000000000000n;

// console.log(Number(a * 100000n / b) / 100000);

const tt = "0xe3b09300";
const x = BigInt(tt) / oneToken;
// Example usage:
const randomInt = getRandomInt(1, 3456);
// console.log(tt);
// console.log(loteryTickets);
// console.log(sample("do it"));

// const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min) + min);
// // Example: Generate a random integer between 1 and 10
// const randomInt = getRandomInt(1, 3);
// console.log(Math.random());

// console.log(Math.floor(Date.now()/1000)+86400);  // 1724495681 
// 1701644962212
// console.log(balances);
// console.log(balances[to]);
const balances = require("./balances");
let nonce = require("./nonce.json");
const { createSignature } = require("./createSignature");
const rewards = BigNumber.from("0x10");
console.log("nonce", nonce);
const signature = createSignature(
  "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",                                                                 // winner 
  rewards._hex,                                                           // value
  nonce++,                                        // nonce
  1724495681,               //1724495681                        // deadline
  "0xd907c3712b7e28a889b28bc3c7db9aa39e59893ae2e90190f6f244d2abfb166e");
// DOMAIN_SEPARATOR
fs.writeFile('nonce.json', JSON.stringify(nonce), (err) => {
  if (err) {
      console.error("Error writing nonce.json:", err);
  }
})
const { r, s, v } = ethers.utils.splitSignature(signature);
console.log("nonce for next signature", nonce);
console.log('r:', r);
console.log('s:', s);
console.log('v:', v);
//0x6f692e8563f1b3779889808adb3eb2831a9bc8dcefdb9b747d22e226b443da13 doma
// const Y = { ...balances };
// Y.value = 10;
// console.log(Y);
// console.log(balances);
