// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsEnum, IsNotEmpty } from 'class-validator';
import { ActionMessageInterface } from './ActionMessageInterface';
import { MessageBody } from '../../core/api/MessageBody';
import { ListingItemMessageType } from '../enums/ListingItemMessageType';

export class ListingItemAddMessage extends MessageBody implements ActionMessageInterface {

    @IsNotEmpty()
    @IsEnum(ListingItemMessageType)
    public action: ListingItemMessageType;

    @IsNotEmpty()
    public item: string;

    public objects: any;

}
