import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { BidService } from '../services/BidService';
import { RpcRequest } from '../requests/RpcRequest';
import { Bid } from '../models/Bid';
import {RpcCommand} from './RpcCommand';
import { BidSearchParams } from '../requests/BidSearchParams';

export class FindBidsCommand implements RpcCommand<Bookshelf.Collection<Bid>> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.BidService) private bidService: BidService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'findbids';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<Bid>> {
        return this.bidService.search({
            status: data.params[0],
            listingItemId: data.params[1],
            profileId: data.params[2]
        } as BidSearchParams);
    }

    public help(): string {
        return 'FindBidsCommand: TODO: Fill in help string.';
    }
}
