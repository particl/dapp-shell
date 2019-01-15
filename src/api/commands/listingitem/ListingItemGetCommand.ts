// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemService } from '../../services/ListingItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ListingItem } from '../../models/ListingItem';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';

export class ListingItemGetCommand extends BaseCommand implements RpcCommandInterface<ListingItem> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) public listingItemService: ListingItemService
    ) {
        super(Commands.ITEM_GET);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: id or hash
     *
     * when data.params[0] is number then findById, else findOneByHash
     *
     * @param data
     * @returns {Promise<ListingItem>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ListingItem> {
        let listingItem;

        if (typeof data.params[0] === 'number') {
            listingItem = await this.listingItemService.findOne(data.params[0]);
        } else {
            listingItem = await this.listingItemService.findOneByHash(data.params[0]);
        }
        return listingItem;
    }

    public usage(): string {
        return this.getName() + ' [<listingItemId>|<hash>] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingItemId>          - [optional] Numeric - The ID of the listing item we want to retrieve. \n'
            + '    <hash>                   - [optional] String - The hash of the listing item we want to retrieve. ';
    }

    public description(): string {
        return 'Get a listing item via listingItemId or hash.';
    }

    public example(): string {
        return 'item ' + this.getName() + ' b90cee25-036b-4dca-8b17-0187ff325dbb';
    }
}
