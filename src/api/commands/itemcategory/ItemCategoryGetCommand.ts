// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Types, Core, Targets } from '../../../constants';
import { ItemCategoryService } from '../../services/ItemCategoryService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemCategory } from '../../models/ItemCategory';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';

export class ItemCategoryGetCommand extends BaseCommand implements RpcCommandInterface<ItemCategory> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ItemCategoryService) private itemCategoryService: ItemCategoryService
    ) {
        super(Commands.CATEGORY_GET);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: id or key
     *
     * when data.params[0] is number then findById, else findOneByKey
     *
     * @param data
     * @returns {Promise<ItemCategory>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ItemCategory> {
        if (typeof data.params[0] === 'number') {
            return await this.itemCategoryService.findOne(data.params[0]);
        } else {
            return await this.itemCategoryService.findOneByKey(data.params[0]);
        }
    }

    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MissingParamException('categoryId|categoryKey');
        }

        const categoryId = data.params[0];
        if (typeof categoryId === 'number') {
            // Throws NotFoundException
            const category = await this.itemCategoryService.findOne(categoryId);
        } else if (typeof categoryId === 'string') {
            const category = await this.itemCategoryService.findOneByKey(categoryId);
            if (!category) {
                throw new NotFoundException('categoryId');
            }
        } else {
            throw new InvalidParamException('categoryId', 'number|string');
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' (<categoryId>|<categoryKey>) ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <categoryId>                  - Numeric - The ID belonging to the category we \n'
            + '                                     want to retrive. \n'
            + '    <categoryKey>                 - String - The key that identifies the category \n'
            + '                                     we want to retrieve. ';
    }

    public description(): string {
        return 'Command for getting an item category associated with category Id or key';
    }

    public example(): string {
        return 'category ' + this.getName() + ' 6 ';
    }
}
