import * as fs from "fs"
import * as util from "util"

import { CommandLineArgs } from "./util/CommandLineArgs.js"
import { options } from "./CLIOptions.js"
import { cliConfig } from "./CLIConfig.js"
import { metaToken, MetaToken } from "./contracts/meta-token.js"
import { ntoy, ONE_NEAR, queryAccount } from "./near-api/near-rpc.js"
import { unix_ts, yton } from "./util/conversion.js"
import { isValidAccountID } from "./near-api/utils/valid.js"

// name of this script
export const nickname = "meta-token"

async function validAccount(account: string) {
  let state = await queryAccount(account);
  let tokenBalance = await metaToken.ft_balance_of(account);
  console.log(`Account:${account}, Token Balance:${yton(tokenBalance)} $META, Native Balance:${yton(state.amount)} N`)
}

// one function for each pub fn in the contract
// get parameters by consuming from CommandLineParser
export class CommandsAPI {

  mint_HELP() {
    return `
       Mints more tokens in the owner account
      
      usage:
      > meta-token mint receiver_id amount
      `};

  async mint(a: CommandLineArgs) /*:void*/ {

    //--these are some examples on how to consume arguments
    //const argumentJson = a.consumeJSON("{ account:userAccount, amount:xxN }")

    //get fn arguments
    const receiverId = a.consumeString("receiver account")
    const amount = a.consumeAmount("amount", 'Y'); // get amount converted to Yoctos

    a.noMoreArgs() // no more positional args should remain

    await validAccount(receiverId);

    await metaToken.mint(receiverId, amount);

    console.log(`minted for ${receiverId} ${yton(amount)}`)

  }

  async add_minter(a: CommandLineArgs) /*:void*/ {

    //get fn arguments
    const account = a.consumeString("to Account")

    a.noMoreArgs() // no more positional args should remain

    await metaToken.add_minter(account);

    await this.get_minters(a);
  }

  async remove_minter(a: CommandLineArgs) /*:void*/ {

    //get fn arguments
    const account = a.consumeString("to Account")

    a.noMoreArgs() // no more positional args should remain

    await metaToken.remove_minter(account);

    await this.get_minters(a);
  }

  async get_minters(a: CommandLineArgs) {
    a.noMoreArgs() // no more positional args should remain
    let list = await metaToken.get_minters()
    console.log(JSON.stringify(list))
  }

  async set_locked_until(a: CommandLineArgs) {
    const timestamp = a.consumeString("unix timestamp")
    a.noMoreArgs() // no more positional args should remain
    let list = await metaToken.set_locked_until(Number(timestamp))
    console.log(JSON.stringify(list))
  }


  get_owner_HELP() {
    return `
       Returns account ID of the token owner.
     
      usage:
      > meta-token get_owner 
      `};

  async get_owner(a: CommandLineArgs) {
    a.noMoreArgs() // no more positional args should remain
    let owner = await metaToken.get_owner_id()
    console.log(owner)
  }


  transfer_HELP() {
    return `
       Transfer amount from signer to receiver with optional memo
      
      usage:
      > meta-token transfer receiverId amount memo
      `};

  async transfer(a: CommandLineArgs) /*:void*/ {

    const receiverId = a.consumeString("receiverId");

    await validAccount(receiverId);

    const amount = a.consumeAmount("amount", 'Y'); // get amount converted to Yoctos

    let memo = undefined
    if (a.moreArgs()) memo = a.consumeString("memo");

    a.noMoreArgs() // no more positional args should remain

    await metaToken.ft_transfer(receiverId, amount, memo)

    console.log(`transferred to ${receiverId} ${yton(amount)} tokens`)

  }

  get_supply_HELP() {
    return `
       Returns token supply 
     
      usage:
      > meta-token get_supply 
      `};

  async get_supply(a: CommandLineArgs) {

    a.noMoreArgs() // no more positional args should remain

    let supply = await metaToken.ft_total_supply()

    console.log(`total supply ${yton(supply)}`)
  }

  balance_HELP() {
    return `
       Returns token balance for an account 
     
      usage:
      > meta-token balance account_id
      `};

  async balance(a: CommandLineArgs) {

    const account = a.consumeString("account")

    a.noMoreArgs() // no more positional args should remain

    let balance = await metaToken.ft_balance_of(account)

    console.log(`${account} balance: ${yton(balance)}`)
  }

  get_metadata_HELP() {
    return `
       Returns token metadata 
     
      usage:
      > meta-token get_metadata
      `};

  async get_metadata(a: CommandLineArgs) {

    a.noMoreArgs() // no more positional args should remain

    let metadata = await metaToken.ft_metadata()

    console.log(util.inspect(metadata));

  }

  set_icon_HELP() {
    return `
       sets metadata icon as an optimized SVG. Use https://petercollingridge.appspot.com/svg-optimiser to create the file
     
      usage:
      > meta-token set_icon file.svg
    `};

  async set_icon(a: CommandLineArgs) {
    const filename = a.consumeString("filename")
    a.noMoreArgs() // no more positional args should remain
    const svgData = fs.readFileSync(filename);
    await metaToken.set_metadata_icon(svgData.toString())
  }

  async vested_accounts_count_HELP() {
    return `
   Returns the number of vested accounts
  
  usage:
  > meta-token vested_accounts_count
  `};

  async vested_accounts_count(a: CommandLineArgs) {
    a.noMoreArgs() // no more positional args should remain
    console.log(await metaToken.vested_accounts_count())
  }

  async mint_vested(a: CommandLineArgs) /*:void*/ {

    //--these are some examples on how to consume arguments
    //const argumentJson = a.consumeJSON("{ account:userAccount, amount:xxN }")

    //get fn arguments
    const receiverId = a.consumeString("receiver account")
    const amount = a.consumeAmount("amount", 'Y'); // get amount converted to Yoctos
    const locked_until_timestamp = a.consumeInt("locked_until unix timestamp")
    const start_linear_timestamp = a.consumeInt("start_linear unix timestamp")
    const end_linear_timestamp = a.consumeInt("end_linear unix timestamp")
    a.noMoreArgs() // no more positional args should remain

    await validAccount(receiverId);

    await metaToken.mint_vested(receiverId, amount, locked_until_timestamp, start_linear_timestamp, end_linear_timestamp);

    console.log(`minted for ${receiverId} ${yton(amount)}`)

  }

  async test_mint_vested(a: CommandLineArgs) /*:void*/ {
    const now_unix_ts = unix_ts()
    const locked_until = now_unix_ts + 5 * 60;
    const start_linear = now_unix_ts + 2 * 60;
    const end_linear = now_unix_ts + 10 * 60;
    await metaToken.mint_vested("test-narwallets.testnet", ntoy(100), locked_until, start_linear, end_linear);
  }

  async vesting_info(a: CommandLineArgs) /*:void*/ {
    const account_id = a.consumeString("account_id")
    a.noMoreArgs() // no more positional args should remain
    const now_unix_ts = unix_ts()
    console.log("now is ", now_unix_ts)
    let result = await metaToken.get_vesting_info(account_id);
    console.log(JSON.stringify(result));
    console.log("to locked-until:", result.locked_until_timestamp - now_unix_ts, "sec");
    console.log("to linear-end:", result.linear_end_timestamp - now_unix_ts, "sec");
    console.log("locked:", BigInt(result.locked) * 100n / BigInt(result.amount), "%");
  }

}
