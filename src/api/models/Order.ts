// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Bookshelf } from '../../config/Database';
import { Collection, Model } from 'bookshelf';
import { OrderItem } from './OrderItem';
import { Address } from './Address';
import { SearchOrder } from '../enums/SearchOrder';
import { OrderSearchParams } from '../requests/OrderSearchParams';

export class Order extends Bookshelf.Model<Order> {

    public static RELATIONS = [
        'OrderItems',
        'OrderItems.Bid',
        'OrderItems.Bid.ListingItem',
        'OrderItems.OrderItemObjects',
        'OrderItems.Bid.ListingItem.ListingItemTemplate',
        'OrderItems.Bid.ListingItem.PaymentInformation',
        'OrderItems.Bid.ListingItem.PaymentInformation.Escrow',
        'OrderItems.Bid.ListingItem.PaymentInformation.Escrow.Ratio',
        'OrderItems.Bid.ShippingAddress',
        'ShippingAddress'
    ];

    public static async fetchById(value: number, withRelated: boolean = true): Promise<Order> {
        if (withRelated) {
            return await Order.where<Order>({ id: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await Order.where<Order>({ id: value }).fetch();
        }
    }

    public get tableName(): string { return 'orders'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Hash(): string { return this.get('hash'); }
    public set Hash(value: string) { this.set('hash', value); }

    public get Buyer(): string { return this.get('buyer'); }
    public set Buyer(value: string) { this.set('buyer', value); }

    public get Seller(): string { return this.get('seller'); }
    public set Seller(value: string) { this.set('seller', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }


    public static async search(options: OrderSearchParams, withRelated: boolean = true): Promise<Collection<Order>> {
        if (!options.ordering) {
            options.ordering = SearchOrder.ASC;
        }

        const orderCollection = Order.forge<Model<Order>>()
            .query( qb => {
                qb.join('order_items', 'orders.id', 'order_items.order_id');
                if (options.listingItemId) {
                    qb.join('bids', 'order_items.bid_id', 'bids.id');
                    qb.where('bids.listing_item_id', '=', options.listingItemId);
                }

                if (options.status && typeof options.status === 'string') {
                    qb.where('order_items.status', '=', options.status);
                }

                if (options.buyerAddress && typeof options.buyerAddress === 'string') {
                    qb.where('orders.buyer', '=', options.buyerAddress);
                }

                if (options.sellerAddress && typeof options.sellerAddress === 'string') {
                    qb.where('orders.seller', '=', options.sellerAddress);
                }
            }).orderBy('orders.created_at', options.ordering);

        if (withRelated) {
            return await orderCollection.fetchAll({
                withRelated: this.RELATIONS
            });
        } else {
            return await orderCollection.fetchAll();
        }
    }

    public OrderItems(): Collection<OrderItem> {
        return this.hasMany(OrderItem, 'order_id', 'id');
    }

    public ShippingAddress(): Address {
        return this.belongsTo(Address, 'address_id', 'id');
    }

}
