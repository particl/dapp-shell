// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { request, validate } from '../../../core/api/Validate';
import { Core, Targets, Types } from '../../../constants';
import { ItemCategoryService } from '../../services/ItemCategoryService';
import { ListingItemService } from '../../services/ListingItemService';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { ListingItemTemplateSearchParams } from '../../requests/ListingItemTemplateSearchParams';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { SearchOrder } from '../../enums/SearchOrder';
import { ListingItemSearchParams } from '../../requests/ListingItemSearchParams';
import { SearchOrderField } from '../../enums/SearchOrderField';
import { MessageException } from '../../exceptions/MessageException';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';

export class ItemCategoryRemoveCommand extends BaseCommand implements RpcCommandInterface<void> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ItemCategoryService) private itemCategoryService: ItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.CATEGORY_REMOVE);
        this.log = new Logger(__filename);
    }

    /**
     * remove user defined category
     * data.params[]:
     *  [0]: categoryId
     *
     * @param data
     * @returns {Promise<void>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<void> {
        const categoryId = data.params[0];
        return await this.itemCategoryService.destroy(categoryId);
    }

    /**
     * data.params[]:
     *  [0]: categoryId
     *
     * @param data
     * @returns {Promise<void>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MissingParamException('categoryId');
        }
        const categoryId = data.params[0];

        await this.itemCategoryService.findOne(categoryId)
            .then(value => {
                const itemCategory = value.toJSON();
                if (itemCategory.key) {
                    throw new MessageException('Default Category cant be removed.');
                }
            })
            .catch(reason => {
                this.log.error(new InvalidParamException('categoryId').getMessage());
                throw new InvalidParamException('categoryId');
            });

        const searchParams = {
            page: 0,
            pageLimit: 10,
            order: SearchOrder.ASC,
            orderField: SearchOrderField.DATE,
            category: categoryId
        } as ListingItemTemplateSearchParams;

        this.log.debug('ListingItemTemplateSearchParams: ', JSON.stringify(searchParams, null, 2));

        // check listingItemTemplate related with category
        await this.listingItemTemplateService.search(searchParams)
            .then(values => {
                const listingItemTemplates = values.toJSON();
                if (listingItemTemplates.length > 0) {
                    this.log.error('Category associated with ListingItemTemplate.');
                    throw new MessageException(`Category associated with ListingItemTemplate can't be deleted. id= ${categoryId}`);
                }
            });

        const defaultListingItemSearchParams = new ListingItemSearchParams();
        defaultListingItemSearchParams.profileId = '*';
        defaultListingItemSearchParams.category = categoryId;

        this.log.debug('ListingItemSearchParams: ', JSON.stringify(defaultListingItemSearchParams, null, 2));

        // check listingItem related with category
        await this.listingItemService.search(defaultListingItemSearchParams)
            .then(values => {
                this.log.debug('values:', JSON.stringify(values, null, 2));
                const listingItems = values.toJSON();
                if (listingItems.length > 0) {
                    this.log.error('Category associated with ListingItem.');
                    throw new MessageException(`Category associated with ListingItem can't be deleted. id= ${categoryId}`);
                }
            });

        return data;
    }

    public usage(): string {
        return this.getName() + ' <categoryId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <categoryId>                  - Numeric - The ID belonging to the category we \n'
            + '                                     want to destroy. ';
    }

    public description(): string {
        return 'Remove and destroy an item category via categoryId.';
    }

    public example(): string {
        return 'category ' + this.getName() + ' 81 ';
    }
}
