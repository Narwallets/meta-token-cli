import * as fs from "fs"
import * as util from "util"

import { CommandLineArgs } from "./util/CommandLineArgs.js"
import { options } from "./CLIOptions.js"
import { cliConfig } from "./CLIConfig.js"
import { metaToken,MetaToken } from "./contracts/meta-token.js"
import { ONE_NEAR, queryAccount } from "./near-api/near-rpc.js"
import { yton } from "./util/conversion.js"
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
      > meta-token mint amount
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

  /* commented, not available, we have to process contract state to get accounts
  get_number_of_accounts_HELP() {
    return `
   Returns the number of accounts
  
  usage:
  > meta-token get_number_of_accounts 
  `};
  get_number_of_accounts(a ) {
    a.noMoreArgs() // no more positional args should remain
    return this._view("get_number_of_accounts")
  }
  */

}
