// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsEnum, IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { OrderItemObjectCreateRequest } from './OrderItemObjectCreateRequest';
import { OrderStatus } from '../enums/OrderStatus';

// tslint:disable:variable-name
export class OrderItemCreateRequest extends RequestBody {

    // @IsNotEmpty()
    // public listing_item_id: number;

    @IsNotEmpty()
    public itemHash: string;

    @IsEnum(OrderStatus)
    @IsNotEmpty()
    public status: OrderStatus;

    public orderItemObjects: OrderItemObjectCreateRequest[];

    @IsNotEmpty()
    public bid_id: number;

    @IsNotEmpty()
    public order_id: number;

}
// tslint:enable:variable-name
