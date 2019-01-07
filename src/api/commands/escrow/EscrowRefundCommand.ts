// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { Escrow } from '../../models/Escrow';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { EscrowActionService } from '../../services/EscrowActionService';
import { EscrowRequest } from '../../requests/EscrowRequest';
import { EscrowMessageType } from '../../enums/EscrowMessageType';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';
import * as _ from 'lodash';
import { OrderStatus } from '../../enums/OrderStatus';
import { BidMessageType} from '../../enums/BidMessageType';
import { OrderItemService } from '../../services/OrderItemService';

export class EscrowRefundCommand extends BaseCommand implements RpcCommandInterface<Escrow> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.EscrowActionService) private escrowActionService: EscrowActionService,
        @inject(Types.Service) @named(Targets.Service.OrderItemService) private orderItemService: OrderItemService
    ) {
        super(Commands.ESCROW_REFUND);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     * [0]: itemhash
     * [1]: accepted
     * [2]: memo
     * [3]: escrowId
     * @param data
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<any> {

        const orderItemModel = await this.orderItemService.findOne(data.params[0]);
        const orderItem = orderItemModel.toJSON();

        if (orderItem.status !== OrderStatus.AWAITING_ESCROW) {
            this.log.error('Order is in invalid state');
            throw new MessageException('Order is in invalid state');
        }

        const bid = orderItem.Bid;
        if (!bid || bid.action !== BidMessageType.MPA_ACCEPT) {
            this.log.error('No valid information to finalize escrow');
            throw new MessageException('No valid information to finalize escrow');
        }

        const listingItem = orderItem.Bid.ListingItem;
        if (_.isEmpty(listingItem)) {
            this.log.error('ListingItem not found!');
            throw new MessageException('ListingItem not found!');
        }

        const paymentInformation = orderItem.Bid.ListingItem.PaymentInformation;
        if (_.isEmpty(paymentInformation)) {
            this.log.error('PaymentInformation not found!');
            throw new MessageException('PaymentInformation not found!');
        }

        const escrow = orderItem.Bid.ListingItem.PaymentInformation.Escrow;
        if (_.isEmpty(escrow)) {
            this.log.error('Escrow not found!');
            throw new MessageException('Escrow not found!');
        }

        const escrowRatio = orderItem.Bid.ListingItem.PaymentInformation.Escrow.Ratio;
        if (_.isEmpty(escrowRatio)) {
            this.log.error('EscrowRatio not found!');
            throw new MessageException('EscrowRatio not found!');
        }

        return this.escrowActionService.refund({
            orderItem,
            accepted: data.params[1],
            memo: data.params[2],
            action: EscrowMessageType.MPA_REFUND
        } as EscrowRequest);
    }

    public usage(): string {
        return this.getName() + ' [<itemhash> [<accepted> [<memo>]]] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <orderItemId>            - String - The id of the OrderItem for which we want to refund the Escrow.\n'
            + '    <accepted>               - String - The accepted status of the escrow \n'
            + '    <memo>                   - String - The memo of the Escrow ';
    }

    public description(): string {
        return 'Refund an escrow.';
    }

}
