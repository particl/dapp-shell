// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemLocationService } from '../../services/ItemLocationService';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import * as _ from 'lodash';
import { MessageException } from '../../exceptions/MessageException';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';

export class ItemLocationRemoveCommand extends BaseCommand implements RpcCommandInterface<void> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ItemLocationService) public itemLocationService: ItemLocationService,
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) public listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.ITEMLOCATION_REMOVE);
        this.log = new Logger(__filename);
    }

    /**
     *
     * data.params[]:
     * [0]: listingItemTemplateId
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<void> {
        const itemInformation = await this.getItemInformation(data);

        // ItemLocation cannot be removed if there's a ListingItem related to ItemInformations ItemLocation. (the item has allready been posted)
        if (itemInformation.listingItemId) {
            throw new MessageException('ItemLocation cannot be removed because the ListingItem has allready been posted!');
        } else {
            return this.itemLocationService.destroy(itemInformation.ItemLocation.id);
        }
    }

    public usage(): string {
        return this.getName() + ' <listingItemTemplateId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingItemTemplateId>  - Numeric - The ID of the listing item template. ';
    }

    public description(): string {
        return 'Remove and destroy an item location associated with listingItemTemplateId.';
    }

    /*
     * TODO: NOTE: This function may be duplicated between commands.
     */
    private async getItemInformation(data: any): Promise<any> {
        // find the existing listing item template
        const listingItemTemplate = await this.listingItemTemplateService.findOne(data.params[0]);

        // find the related ItemInformation
        const itemInformation = listingItemTemplate.related('ItemInformation').toJSON();

        // Through exception if ItemInformation or ItemLocation does not exist
        if (_.size(itemInformation) === 0 || _.size(itemInformation.ItemLocation) === 0) {
            this.log.warn(`ItemInformation or ItemLocation with the listingItemTemplateId=${data.params[0]} was not found!`);
            throw new MessageException(`ItemInformation or ItemLocation with the listingItemTemplateId=${data.params[0]} was not found!`);
        }

        return itemInformation;
    }
}
