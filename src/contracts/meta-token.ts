import * as near from '../near-api/near-rpc.js';
import {ntoy} from '../near-api/near-rpc.js';
import { SmartContract } from './base-smart-contract.js';

import {FungibleTokenMetadata, NEP141Trait} from "./NEP141.js"

type U128String = string;
type U64String = string;

export class MetaToken extends NEP141Trait {

    async mint(accountId:string, amount:U128String):Promise<void>{
        return this.call("mint",{account_id:accountId, amount:amount},50,"1"); //one-yocto attached
    }

    async add_minter(accountId:string):Promise<void>{
        return this.call("add_minter",{account_id:accountId},50,"1"); //one-yocto attached
    }
    async remove_minter(accountId:string):Promise<void>{
        return this.call("remove_minter",{account_id:accountId},50,"1"); //one-yocto attached
    }
    async get_minters():Promise<string>{
        return this.view("get_minters",{});
    }

    async get_owner_id():Promise<string>{
        return this.view("get_owner_id",{});
    }

    async set_metadata_icon(svg_string:string):Promise<void>{
        return this.call("set_metadata_icon",{svg_string:svg_string},75,"1"); //one-yocto attached
    }
    
    async set_metadata_reference(reference:string, reference_hash:string):Promise<void>{
        return this.call("set_metadata_icon",{reference:reference, reference_hash:reference_hash},25,"1"); //one-yocto attached
    }
}

//export singleton
export let chedder = new MetaToken(); 

