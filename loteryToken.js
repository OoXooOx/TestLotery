const holders = [
    "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
    "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",
    "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db",
    "0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB",
    "0x17F6AD8Ef982297579C203069C1DbfFE4348c372",
    "0x03C6FcED478cBbC9a4FAB34eF9f40767739D1Ff7",
    "0x1aE0EA34a72D944a8C7603FfB3eC30a6669E454C", 
    "0x14723A09ACff6D2A60DcdF7aA4AFf308FDDC160C"
]
const holderBalancesForLotery = new Map();
const loteryTickets = new Map();

holderBalancesForLotery.set('0x5B38Da6a701c568545dCfcB03FcB875f56beddC4', 1);
holderBalancesForLotery.set('0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2', 7);
holderBalancesForLotery.set('0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db', 11);
holderBalancesForLotery.set('0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB', 20);
holderBalancesForLotery.set('0x17F6AD8Ef982297579C203069C1DbfFE4348c372', 9);
holderBalancesForLotery.set('0x03C6FcED478cBbC9a4FAB34eF9f40767739D1Ff7', 14);
holderBalancesForLotery.set('0x1aE0EA34a72D944a8C7603FfB3eC30a6669E454C', 15);
holderBalancesForLotery.set('0x14723A09ACff6D2A60DcdF7aA4AFf308FDDC160C', 17);
const getTotal = () =>{
    let result=0;
    holders.map((el)=>{
        result+=holderBalancesForLotery.get(el);
    })
    return result;
}

const totalSupply = getTotal();
const getMedianOfQuantity = () => {
    return Math.floor(totalSupply / 2);
}
function executeLotery() {
    let rightStartPoint = getMedianOfQuantity() + 1;
    let leftStartPoint = getMedianOfQuantity();
    let totalQuantityTokensForLotery = totalSupply;
    let holdersTemp = [...holders];
    let count = 0;
    let countOfNotEnoughFounds = 0;
    while (totalQuantityTokensForLotery > 0) {
        if (count == 0) {
            if (holdersTemp.length > totalSupply - rightStartPoint + 1) {
                let howMuchIcanFill = totalSupply - rightStartPoint + 1;
                let IcanFill = holdersTemp.slice(0, howMuchIcanFill);
                let cantFill = holdersTemp.slice(howMuchIcanFill, holdersTemp.length);
                for (let i = 0; i < IcanFill.length; i++) {
                    loteryTickets.set(rightStartPoint + i, IcanFill[i]);
                    holderBalancesForLotery.set(IcanFill[i], holderBalancesForLotery.get(IcanFill[i]) - 1);
                    if (holderBalancesForLotery.get(IcanFill[i]) !== 0) {
                        cantFill.push(IcanFill[i]);
                    }
                }
                totalQuantityTokensForLotery -= IcanFill.length;
                holdersTemp=cantFill;
                rightStartPoint=totalSupply+1;
                count = 1; 
            } else {
                for (let i = 0; i < holdersTemp.length; i++) { 
                    loteryTickets.set(rightStartPoint + i, holdersTemp[i]);
                    holderBalancesForLotery.set(holdersTemp[i], holderBalancesForLotery.get(holdersTemp[i]) - 1);
                    if (holderBalancesForLotery.get(holdersTemp[i]) === 0) {
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
                holderBalancesForLotery.set(holdersTemp[i], holderBalancesForLotery.get(holdersTemp[i]) - 1);
                if (holderBalancesForLotery.get(holdersTemp[i]) === 0) {
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
            if (rightStartPoint <= totalSupply) {
                count = 0;
            }
            countOfNotEnoughFounds = 0;
        }
    }
    console.log(loteryTickets);
    console.log(process.memoryUsage());
}

executeLotery()

