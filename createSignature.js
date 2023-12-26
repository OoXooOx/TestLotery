const ethers = require("ethers")

const createSignature = (winnerAddress, amount, nonce, deadline, domainSeparator) => {
    try {
        const validPayload = ethers.utils.defaultAbiCoder.encode(
            ["bytes32", "address", "uint256", "uint256", "uint256"],
            [
                "0x63e295758710f1c68a97c6ce3047ffb03df3d558a6799acfe47ae0f28fbbc6ad", // Claim_TYPEHASH
                winnerAddress,   
                amount,
                nonce,                                          
                deadline                                      
            ]
        )
        // console.log("valid", validPayload);
        const hash = ethers.utils.solidityKeccak256(["bytes"], [validPayload]);
        // console.log(hash);

        const data_ = ethers.utils.solidityPack(
            ["string", "bytes32", "bytes32"],
            ['\x19\x01', domainSeparator, hash])
        // console.log("data_", data_);
        const data = ethers.utils.solidityKeccak256(["bytes"], [data_])
        // console.log("data", data);
        // private key from [0] acc hardhat  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
        const key = new ethers.utils.SigningKey("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80")
        const signData = key.signDigest(data)
        return signData;
    } catch (error) {
        console.log(error.message);
    }
}
module.exports = {
    createSignature
};

