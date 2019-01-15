// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

/**
 * core.api.HashableListingItem
 *
 */
import * as resources from 'resources';
import { ListingItemCreateRequest } from '../../api/requests/ListingItemCreateRequest';
import { ListingItemTemplateCreateRequest } from '../../api/requests/ListingItemTemplateCreateRequest';

type AllowedHashableTypes = resources.ListingItem | resources.ListingItemTemplate | ListingItemCreateRequest | ListingItemTemplateCreateRequest;

export class HashableListingItem {

    public title: string;
    public shortDescription: string;
    public longDescription: string;
    public basePrice: string;
    public paymentAddress: string;
    public messagingPublicKey: string;

    public nullItemTimestamp: Date;

    // TODO: refactor
    constructor(hashThis: AllowedHashableTypes, timestampedHash: boolean = false ) {
        const input = JSON.parse(JSON.stringify(hashThis));

        if (input) {
            if (!input.itemInformation && !input.paymentInformation && !input.messagingInformation && !input.listingItemObjects) { // model
                input.ItemInformation = input.ItemInformation
                    ? input.ItemInformation : {};
                input.PaymentInformation    = input.PaymentInformation
                    ? input.PaymentInformation : {};
                input.PaymentInformation.ItemPrice = input.PaymentInformation.ItemPrice
                    ? input.PaymentInformation.ItemPrice : {};
                input.PaymentInformation.ItemPrice.CryptocurrencyAddress = input.PaymentInformation.ItemPrice.CryptocurrencyAddress
                    ? input.PaymentInformation.ItemPrice.CryptocurrencyAddress : {};
                input.MessagingInformation  = input.MessagingInformation
                    ? input.MessagingInformation : {};
                input.ListingItemObjects    = input.ListingItemObjects
                    ? input.ListingItemObjects : {};

                input.itemInformation = input.ItemInformation;
                input.paymentInformation = input.PaymentInformation;
                input.paymentInformation.itemPrice = input.PaymentInformation.ItemPrice;
                input.paymentInformation.itemPrice.cryptocurrencyAddress = input.PaymentInformation.ItemPrice.CryptocurrencyAddress;
                input.messagingInformation = input.MessagingInformation;
                input.listingItemObjects = input.ListingItemObjects;
            } else {
                input.itemInformation = input.itemInformation
                    ? input.itemInformation : {};
                input.paymentInformation    = input.paymentInformation
                    ? input.paymentInformation : {};
                input.paymentInformation.itemPrice = input.paymentInformation.itemPrice
                    ? input.paymentInformation.itemPrice : {};
                input.paymentInformation.itemPrice.cryptocurrencyAddress = input.paymentInformation.itemPrice.cryptocurrencyAddress
                    ? input.paymentInformation.itemPrice.cryptocurrencyAddress : {};
                input.messagingInformation  = input.messagingInformation
                    ? input.messagingInformation : {};
                input.listingItemObjects    = input.listingItemObjects
                    ? input.listingItemObjects : {};

            }
            this.title              = input.itemInformation.title;
            this.shortDescription   = input.itemInformation.shortDescription;
            this.longDescription    = input.itemInformation.longDescription;
            this.basePrice          = input.paymentInformation.itemPrice.basePrice;
            this.paymentAddress     = input.paymentInformation.itemPrice.cryptocurrencyAddress.address;
            this.messagingPublicKey = input.messagingInformation.publicKey;

            // TODO: add listingitemobjects to hash

            // hack: allow empty objects for now
            if ((!this.title && !this.shortDescription && !this.longDescription && !this.basePrice && !this.paymentAddress && !this.messagingPublicKey)
                || timestampedHash) {
                this.nullItemTimestamp = new Date();
            }
        }
    }

}
