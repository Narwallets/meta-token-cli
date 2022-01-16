#!/bin/node
import { cliConfig } from "./CLIConfig.js"
import { nickname } from "./CommandsAPI.js"
import { options } from "./CLIOptions.js"
import { CommandLineArgs, OptionDeclaration } from "./util/CommandLineArgs.js"
import * as color from "./util/color.js"
import { ExtensionAPI } from "./ExtensionAPI.js"
import { saveConfig } from "./util/saveConfig.js"
import { metaToken, MetaToken } from "./contracts/meta-token.js"

import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { cpuUsage, env } from "process"
import { setNetwork } from './near-api/network.js'
import { FungibleTokenMetadata } from "./contracts/NEP141.js"

// default accountId
options.accountId.value = cliConfig.userAccount

// process command line args
const args = new CommandLineArgs(options)

// command is the 1st positional argument
const command = args.getCommand()

// Show config info if requested
// Set config if requested
if (options.cliconfig.value) {
    saveConfig(options.accountId.value, options.contractName.value)
    process.exit(0)
}
if (options.info.value) {
    console.log(`config.js:`)
    console.log(`  Your account    : ${color.yellow}${cliConfig.userAccount}${color.normal}`)
    console.log(`  Contract account: ${color.yellow}${cliConfig.contractAccount}${color.normal}`)
    process.exit(0)
}

function getCredentials(accountId: string) {
    const homedir = os.homedir()
    let folder = accountId.endsWith(".near")?"mainnet":"testnet"
    const CREDENTIALS_FILE = path.join(homedir, ".near-credentials/"+folder+"/" + accountId + ".json")
    let credentialsString = fs.readFileSync(CREDENTIALS_FILE).toString();
    credentials = JSON.parse(credentialsString)
    if (!credentials.private_key) {
        throw Error("INVALID CREDENTIALS FILE. no priv.key")
    }
}

// TODO configure
// if (command=="configure") {
//     args.requireOptionString(options.accountId,"default account Id")
//     process.exit(0);
// }

// -------------------
// PROCESS COMMAND //
// -------------------

// get contract API + Extensions
const commandAPI = new ExtensionAPI()

// check the command is in the API
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (command && typeof (commandAPI as any)[command] !== "function") {
    color.logErr("unknown command " + color.yellow + command + color.normal)
    console.log(`${nickname} --help to see a list of commands`)
    process.exit(1)
}

// Show help if requested or if no command
if (options.help.value || !command) {
    args.ShowHelpPage(command, commandAPI)
    process.exit(0)
}

setNetwork(cliConfig.net);
// get credentials
let credentials = { account_id: "", private_key: "" };
getCredentials(cliConfig.userAccount);
metaToken.contract_account = cliConfig.contractAccount;
metaToken.signer = cliConfig.userAccount;
metaToken.signer_private_key = credentials.private_key;

type commandFn = (a: CommandLineArgs) => void;

execute((commandAPI as any)[command], args)

async function execute(command: commandFn, args: any) {
    try {

        if (options.networkId.value) setNetwork(options.networkId.value);
        await command.bind(commandAPI)(args);
    }
    catch (ex) {
        console.log(color.red + "Error:" + color.normal);
        console.error(ex);
    }
}
// call the commands API function
// eslint-disable-next-line @typescript-eslint/no-explicit-any

//    (API as any)[command](args)

