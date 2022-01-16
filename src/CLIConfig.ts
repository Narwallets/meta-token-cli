// near defaults to testnet
const net = process.env.NEAR_ENV || "testnet";
console.log("network:", net)

export const cliConfig = {
    net: net,
    nickname: 'meta-token',
    userAccount: net == "mainnet" ? "narwallets.near" : "lucio.testnet",
    contractAccount: net == "mainnet" ? "meta-token.near" : "token.meta.pool.testnet",
}

console.log("user:", cliConfig.userAccount)
console.log("contractAccount:", cliConfig.contractAccount)