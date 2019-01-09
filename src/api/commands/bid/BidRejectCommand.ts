// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import * as resources from 'resources';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { ListingItemService } from '../../services/ListingItemService';
import { MessageException } from '../../exceptions/MessageException';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { BidActionService } from '../../services/BidActionService';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { BidService } from '../../services/BidService';
import { BidRejectReason } from '../../enums/BidRejectReason';

export class BidRejectCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.BidService) private bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.BidActionService) private bidActionService: BidActionService
    ) {
        super(Commands.BID_REJECT);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     * [0]: bidId: number
     *
     * @param {RpcRequest} data
     * @returns {Promise<SmsgSendResponse>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<SmsgSendResponse> {

        const bidId = data.params[0];
        const reason = BidRejectReason[data.params[1]];
        const bid: resources.Bid = await this.bidService.findOne(bidId)
            .then(value => {
                return value.toJSON();
            });

        return this.bidActionService.reject(bid, reason);
    }

    /**
     * data.params[]:
     * [0]: bidId
     * [1]: reasonId
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        if (data.params.length < 1) {
            this.log.error('Missing bidId.');
            throw new MessageException('Missing bidId.');
        }

        if (typeof data.params[0] !== 'number') {
            this.log.error('bidId should be a number.');
            throw new MessageException('bidId should be a number.');
        }

        if (data.params.length >= 2) {
            const reason = data.params[1];
            if (typeof reason !== 'string') {
                this.log.error('reasonEnum should be a string.');
                throw new MessageException('reasonEnum should be a string.');
            } else if (!BidRejectReason[reason]) {
                this.log.error('reasonEnum should be a string with one of these values {OUT_OF_STOCK}.');
                throw new MessageException('reasonEnum should be a string with one of these values {OUT_OF_STOCK}.');
            }
        }

        const bidId = data.params[0];
        let bid: any = await this.bidService.findOne(bidId);
        if (!bid) {
            this.log.error('Bid with specified bidId not found.');
            throw new MessageException('Bid with specified bidId not found.');
        }
        bid = bid.toJSON();

        // make sure ListingItem exists
        if (_.isEmpty(bid.ListingItem)) {
            this.log.error('ListingItem not found in bid.');
            throw new MessageException('ListingItem not found in bid.');
        }

        // make sure we have a ListingItemTemplate, so we know it's our item
        if (_.isEmpty(bid.ListingItem.ListingItemTemplate)) {
            this.log.error('Not your ListingItem.');
            throw new MessageException('Not your ListingItem.');
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <bidId> <reasonId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
        // + '    <itemhash>               - String - The hash if the item whose bid we want to reject. '
        + '    <bidId>                  - Numeric - The ID of the bid we want to reject. '
        + '    <reasonId>               - [optional] Enum {OUT_OF_STOCK} - The predefined reason you want to specify for cancelling the bid. ';
    }

    public description(): string {
        return 'Reject bid.';
    }

    public example(): string {
        return 'bid ' + this.getName() + ' b90cee25-036b-4dca-8b17-0187ff325dbb OUT_OF_STOCK ';
    }
}
