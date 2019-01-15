// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageSize } from '../../responses/MessageSize';

export class ListingItemTemplateSizeCommand extends BaseCommand implements RpcCommandInterface<MessageSize> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) public listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.TEMPLATE_SIZE);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: ListingItemTemplate.id
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<MessageSize> {

        const listingItemTemplateModel = await this.listingItemTemplateService.findOne(data.params[0]);
        const listingItemTemplate = listingItemTemplateModel.toJSON();
        return await this.listingItemTemplateService.calculateMarketplaceMessageSize(listingItemTemplate);
    }

    public usage(): string {
        return this.getName() + ' <listingTemplateId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingTemplateId>           - Numeric - The Id of the ListingItemTemplate. ';
    }

    public description(): string {
        return 'Calculate and return ListingItemTemplate size and whether it fits in a single SmsgMessage or not.';
    }

    public example(): string {
        return 'template ' + this.getName() + ' 1';
    }
}
