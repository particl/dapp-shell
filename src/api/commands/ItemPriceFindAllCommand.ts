import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ItemPriceService } from '../services/ItemPriceService';
import { RpcRequest } from '../requests/RpcRequest';
import { ItemPrice } from '../models/ItemPrice';
import {RpcCommand} from './RpcCommand';

export class ItemPriceFindAllCommand implements RpcCommand<Bookshelf.Collection<ItemPrice>> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemPriceService) private itemPriceService: ItemPriceService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'itemprice.findall';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<ItemPrice>> {
        return this.itemPriceService.findAll();
    }

    public help(): string {
        return 'ItemPriceFindAllCommand: TODO: Fill in help string.';
    }
}
