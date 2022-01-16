import * as near from '../near-api/near-rpc.js';
import { ntoy } from '../near-api/near-rpc.js';
import { SmartContract } from './base-smart-contract.js';

import { FungibleTokenMetadata, NEP141Trait } from "./NEP141.js"

type U128String = string;
type U64String = string;

export class MetaToken extends NEP141Trait {

    async mint(accountId: string, amount: U128String): Promise<void> {
        return this.call("mint", { account_id: accountId, amount: amount }, 50, "1"); //one-yocto attached
    }

    async add_minter(accountId: string): Promise<void> {
        return this.call("add_minter", { account_id: accountId }, 50, "1"); //one-yocto attached
    }
    async remove_minter(accountId: string): Promise<void> {
        return this.call("remove_minter", { account_id: accountId }, 50, "1"); //one-yocto attached
    }
    async get_minters(): Promise<string> {
        return this.view("get_minters", {});
    }

    async get_owner_id(): Promise<string> {
        return this.view("get_owner_id", {});
    }

    async set_metadata_icon(svg_string: string): Promise<void> {
        return this.call("set_metadata_icon", { svg_string: svg_string }, 75, "1"); //one-yocto attached
    }

    async set_metadata_reference(reference: string, reference_hash: string): Promise<void> {
        return this.call("set_metadata_icon", { reference: reference, reference_hash: reference_hash }, 25, "1"); //one-yocto attached
    }

    async set_locked_until(unix_timestamp: number): Promise<void> {
        return this.call("set_locked_until", { unix_timestamp: unix_timestamp }, 25);
    }

    async vested_accounts_count(): Promise<number> {
        return this.view("vested_accounts_count", {});
    }

    async mint_vested(accountId: string, amountYoctos: U128String,
        locked_until_unix_timestamp: number,
        linear_start_unix_timestamp: number,
        linear_end_unix_timestamp: number,
    ): Promise<void> {
        return this.call("mint_vested", { account_id: accountId, amount: amountYoctos,
            locked_until_timestamp: locked_until_unix_timestamp,
            linear_start_timestamp: linear_start_unix_timestamp,
            linear_end_timestamp: linear_end_unix_timestamp,
        }, 50, "1"); //one-yocto attached
    }

    async get_vesting_info(accountId: string): Promise<any> {
        return this.view("get_vesting_info", { account_id: accountId});
    }


}

//export singleton
export let metaToken = new MetaToken();

